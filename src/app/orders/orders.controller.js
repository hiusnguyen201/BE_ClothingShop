import {
  getOrderByIdService,
  newOrderService,
  addOrderStatusHistoryByIdService,
  getAndCountOrdersService,
  removeOrderByIdService,
  calculateOrderService,
  saveOrderService,
  getAndCountOrdersByCustomerService,
} from '#src/app/orders/orders.service';
import { HttpException } from '#src/core/exception/http-exception';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import {
  cancelGHNOrderService,
  createGHNOrderService,
  getDistrictService,
  getProvinceService,
  getTrackingDetailsService,
  getWardService,
} from '#src/modules/GHN/ghn.service';
import { Code } from '#src/core/code/Code';
import { ONLINE_PAYMENT_METHOD, PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import { LOW_STOCK_WARNING_LEVEL, ORDER_STATUS } from '#src/app/orders/orders.constant';
import { newOrderDetailService, saveOrderItemsService } from '#src/app/order-details/order-details.service';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { OrderDto } from '#src/app/orders/dtos/order.dto';
import {
  decreaseProductVariantsQuantityByOrder,
  getProductVariantByIdService,
  increaseProductVariantsQuantityByOrderService,
} from '#src/app/product-variants/product-variants.service';
import { newPaymentService, savePaymentService, updatePaymentByIdService } from '#src/app/payments/payments.service';
import { createMomoPaymentService, refundMomoPaymentService } from '#src/modules/online-banking/momo/momo.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { createOrderJob, orderQueueEvent } from '#src/app/orders/orders.worker';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { generateQRCodeBuffer } from '#src/utils/qrcode.util';
import { checkValidAddressService } from '#src/modules/geoapify/geoapify.service';
import { validateSchema } from '#src/core/validations/request.validation';
import { CreateOrderDto } from '#src/app/orders/dtos/create-order.dto';
import { GetListOrderDto } from '#src/app/orders/dtos/get-list-order.dto';
import { GetOrderDto } from '#src/app/orders/dtos/get-order.dto';
import { CreateOrderGhnDto } from '#src/app/orders/dtos/create-order-ghn.dto';
import { getCustomerByIdService } from '#src/app/customers/customers.service';
import {
  notifyClientsOfCancelOrder,
  notifyClientsOfCompleteOrder,
  notifyClientsOfConfirmOrder,
  notifyClientsOfLowStock,
  notifyClientsOfNewOrder,
  notifyClientsOfProcessingOrder,
  notifyClientsOfReadyForPickupOrder,
  notifyClientsOfShippingOrder,
} from '#src/app/notifications/notifications.service';
import {
  deleteOrderFromCache,
  getOrderFromCache,
  getTotalCountAndListOrderFromCache,
  setOrderToCache,
  setTotalCountAndListOrderToCache,
} from '#src/app/orders/orders-cache.service';

export async function createOrderController(req) {
  const adapter = await validateSchema(CreateOrderDto, req.body);

  // Validation
  const customer = await getCustomerByIdService(adapter.customerId, { type: USER_TYPE.CUSTOMER });
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const province = await getProvinceService(adapter.provinceId);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const district = await getDistrictService(adapter.districtId, adapter.provinceId);
  if (!district) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const ward = await getWardService(adapter.wardCode, adapter.districtId);
  if (!ward) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' });
  }

  const fullAddress = `${adapter.address}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;

  const validAddress = await checkValidAddressService(fullAddress);
  if (!validAddress) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid address' });
  }

  // Logic (CREATE ORDER PENDING)
  const job = await createOrderJob({
    customerId: customer._id,
    customerName: adapter.customerName,
    customerEmail: adapter.customerEmail,
    customerPhone: adapter.customerPhone,
    provinceName: province.ProvinceName,
    districtName: district.DistrictName,
    wardName: ward.WardName,
    address: adapter.address,
    productVariants: adapter.productVariants,
    paymentMethod: adapter.paymentMethod,
    baseUrl: req.protocol + '://' + req.get('host'),
  });

  const newOrder = await job.waitUntilFinished(orderQueueEvent);

  // Clear cache
  await deleteOrderFromCache(newOrder._id);

  // Transform
  const orderDetail = await getOrderByIdService(newOrder._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);

  // Notify to client
  await notifyClientsOfNewOrder({
    orderId: orderDto.id,
    code: orderDto.code,
    total: orderDto.total,
  });

  return ApiResponse.success(orderDto);
}

export async function getAllOrdersController(req) {
  const adapter = await validateSchema(GetListOrderDto, req.query);

  const filters = {
    ...(adapter.customerId && { customerId: adapter.customerId }),
    ...(adapter.status && { status: adapter.status }),
    ...((adapter.minTotal || adapter.maxTotal) && {
      total: {
        ...(adapter.minTotal && { $gte: adapter.minTotal }),
        ...(adapter.maxTotal && { $lte: adapter.maxTotal }),
      },
    }),
    ...(adapter.keyword === ''
      ? { code: { $ne: null } }
      : {
          $expr: {
            $regexMatch: {
              input: { $toString: '$code' },
              regex: adapter.keyword,
              options: 'i',
            },
          },
        }),
  };

  let [totalCountCached, ordersCached] = await getTotalCountAndListOrderFromCache({ ...adapter, ...filters });

  // if (ordersCached.length === 0) {
  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, orders] = await getAndCountOrdersService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  await setTotalCountAndListOrderToCache(adapter, totalCount, orders);

  totalCountCached = totalCount;
  ordersCached = orders;
  // }

  const ordersDto = ModelDto.newList(OrderDto, ordersCached);
  return ApiResponse.success({ totalCount: totalCountCached, list: ordersDto });
}

// ??
export async function getAllOrdersByCustomerController(req) {
  const { id } = req.user;
  const adapter = await validateSchema(GetListOrderDto, req.query);

  const filters = {
    customer: id,
    ...(adapter.status ? { status: adapter.status } : {}),
    // keyword: adapter.keyword,
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, orders] = await getAndCountOrdersByCustomerService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success({ totalCount, list: ordersDto });
}

export async function getOrderByIdController(req) {
  const adapter = await validateSchema(GetOrderDto, req.params);

  let order = await getOrderFromCache(adapter.orderId);
  if (!order) {
    order = await getOrderByIdService(adapter.orderId);
    await setOrderToCache(adapter.orderId, order);
  }

  if (!order) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  let trackingLog = null;
  if (order.trackingNumber) {
    trackingLog = await getTrackingDetailsService(order.trackingNumber);
  }

  const orderDto = ModelDto.new(OrderDto, { ...order, trackingLog });
  return ApiResponse.success(orderDto);
}

export async function createOrderControllerLogic(data) {
  const warningLowStockProductVariants = [];

  const result = await TransactionalServiceWrapper.execute(async (session) => {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      provinceName,
      districtName,
      wardName,
      address,
      productVariants,
      paymentMethod,
      baseUrl,
      paymentRedirectUrl = '',
    } = data;

    // Create order instance (PENDING)
    const newOrder = newOrderService({
      customerName,
      customerEmail,
      customerPhone,
      provinceName,
      districtName,
      wardName,
      address: address,
      shippingFee: 0,
      customer: customerId,
      orderDate: new Date(),
      orderStatusHistory: [{ status: ORDER_STATUS.PENDING }],
    });

    // Create order items instance
    const orderItems = await Promise.all(
      productVariants.map(async (variant) => {
        const variantExisted = await getProductVariantByIdService(variant.id);
        if (!variantExisted) {
          throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
        }

        if (variantExisted.quantity <= LOW_STOCK_WARNING_LEVEL) {
          warningLowStockProductVariants.push({
            productId: variantExisted.product._id,
            productName: variantExisted.product.name,
            thumbnail: variantExisted.product.thumbnail,
            variantId: variantExisted._id,
            quantity: variantExisted.quantity - variant.quantity,
            variantValues: variantExisted.variantValues.map((item) => ({
              optionName: item.option.name,
              optionValue: item.optionValue.valueName,
            })),
          });
        }

        if (variant.quantity > variantExisted.quantity) {
          throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Product variant quantity not enough' });
        }

        const orderDetail = newOrderDetailService({
          quantity: variant.quantity,
          order: newOrder._id,
          product: variantExisted.product,
          variant: variantExisted._id,
          unitPrice: variantExisted.price,
          totalPrice: variantExisted.price * variant.quantity,
        });

        return orderDetail;
      }),
    );

    // Decrease quantity of product variants
    await decreaseProductVariantsQuantityByOrder(
      orderItems.map((item) => ({ variantId: item.variant, quantity: item.quantity })),
      session,
    );

    // Save order items
    await saveOrderItemsService(orderItems, session);
    newOrder.orderDetails = orderItems.map((item) => item._id);

    // Calculate order
    const calculation = calculateOrderService(orderItems);
    newOrder.quantity = calculation.totalQuantity;
    newOrder.subTotal = calculation.subTotal;
    newOrder.total = calculation.totalPrice;

    // Create payment instance
    const newPayment = newPaymentService({
      order: newOrder._id,
      paymentMethod,
      status: PAYMENT_STATUS.PENDING,
    });
    newOrder.payment = newPayment._id;

    // Save order
    const insertResult = await saveOrderService(newOrder, session);

    // Handle payment method
    if (paymentMethod === ONLINE_PAYMENT_METHOD.MOMO) {
      const momoResponse = await createMomoPaymentService(
        baseUrl,
        paymentRedirectUrl,
        insertResult._id,
        newOrder.total,
      );

      const buffer = await generateQRCodeBuffer(momoResponse.qrCodeUrl);
      const result = await uploadImageBufferService({ buffer, folderName: 'payment-qrcode' });
      newPayment.paymentUrl = momoResponse.payUrl;
      newPayment.qrCodeUrl = result.url;
    }

    await savePaymentService(newPayment, session);

    return insertResult;
  });

  await Promise.all(warningLowStockProductVariants.map(notifyClientsOfLowStock));

  return result;
}

export async function confirmOrderController(req) {
  const adapter = await validateSchema(CreateOrderGhnDto, req.body);

  const orderExisted = await getOrderByIdService(adapter.orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  if (currentStatus !== ORDER_STATUS.PENDING) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid order status' });
  }

  await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.CONFIRMED);

  // Clear cache
  await deleteOrderFromCache(orderExisted._id);

  // Transform
  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);

  await notifyClientsOfConfirmOrder({
    orderId: orderDto.id,
    code: orderDto.code,
    customerName: orderDto.customer.name,
    total: orderDto.total,
  });

  return ApiResponse.success(orderDto);
}

export async function processingOrderController(req) {
  const adapter = await validateSchema(CreateOrderGhnDto, req.body);

  const orderExisted = await getOrderByIdService(adapter.orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  if (currentStatus !== ORDER_STATUS.CONFIRMED) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid order status' });
  }

  await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.PROCESSING);

  // Clear cache
  await deleteOrderFromCache(orderExisted._id);

  // Transform
  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);

  await notifyClientsOfProcessingOrder({
    orderId: orderDto.id,
    code: orderDto.code,
    customerName: orderDto.customer.name,
    total: orderDto.total,
  });

  return ApiResponse.success(orderDto);
}

export async function cancelOrderController(req) {
  const adapter = await validateSchema(CreateOrderGhnDto, req.body);

  const orderExisted = await getOrderByIdService(adapter.orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  if ([ORDER_STATUS.SHIPPING, ORDER_STATUS.COMPLETED, PAYMENT_STATUS.PAID].includes(currentStatus)) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Invalid order status' });
  }

  await TransactionalServiceWrapper.execute(async (session) => {
    // Increase quantity of product variants
    await increaseProductVariantsQuantityByOrderService(
      orderExisted.orderDetails.map((item) => ({ quantity: item.quantity, variantId: item.variant._id })),
      session,
    );

    // refund
    if (orderExisted.payment.status === PAYMENT_STATUS.PAID) {
      const result = await refundMomoPaymentService(orderExisted._id, orderExisted.payment);

      if (!result) {
        throw HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Refund payment failed' });
      }

      await updatePaymentByIdService(orderExisted.payment._id, { status: PAYMENT_STATUS.REFUND }, session);
    } else {
      await updatePaymentByIdService(orderExisted.payment._id, { status: PAYMENT_STATUS.CANCELLED }, session);
    }

    // Remove shipping order
    if (orderExisted.trackingNumber) {
      const result = await cancelGHNOrderService(orderExisted.trackingNumber);
      if (!result) {
        throw HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Cancel shipping order failed' });
      }
    }

    await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.CANCELLED);
  });

  // Clear cache
  await deleteOrderFromCache(orderExisted._id);

  // Transform
  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);

  await notifyClientsOfCancelOrder({
    orderId: orderDto.id,
    code: orderDto.code,
    customerName: orderDto.customer.name,
    total: orderDto.total,
  });

  return ApiResponse.success(orderDto);
}

export async function createShippingOrderController(req) {
  const adapter = await validateSchema(CreateOrderGhnDto, req.body);

  const orderExisted = await getOrderByIdService(adapter.orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  if (currentStatus !== ORDER_STATUS.PROCESSING) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid order status' });
  }

  const newOrderGhn = await createGHNOrderService(orderExisted);
  if (!newOrderGhn || newOrderGhn?.code != 200) {
    throw HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Create order ship failed' });
  }

  await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.READY_TO_PICK, {
    trackingNumber: newOrderGhn.data.order_code,
    estimatedDeliveryAt: newOrderGhn.data.expected_delivery_time,
  });

  // Clear cache
  await deleteOrderFromCache(orderExisted._id);

  // Transform
  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);

  await notifyClientsOfReadyForPickupOrder({
    orderId: orderDto.id,
    code: orderDto.code,
    customerName: orderDto.customer.name,
    total: orderDto.total,
  });

  return ApiResponse.success(orderDto);
}

export async function removeOrderController(req) {
  const adapter = await validateSchema(GetOrderDto, req.params);

  const orderExisted = await getOrderByIdService(adapter.orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  if (orderExisted.orderStatusHistory[0].status !== ORDER_STATUS.PENDING) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
  }

  await TransactionalServiceWrapper.execute(async (session) => {
    await increaseProductVariantsQuantityByOrderService(
      orderExisted.orderDetails.map((item) => ({ quantity: item.quantity, variantId: item.variant._id })),
      session,
    );
    await removeOrderByIdService(orderExisted._id, session);
  });

  // Clear cache
  await deleteOrderFromCache(orderExisted._id);

  return ApiResponse.success({ id: orderExisted._id });
}

export async function webHookUpdateOrder(req) {
  const { Status, OrderCode } = req.body;

  if (!OrderCode) {
    throw HttpException.new({
      code: Code.BAD_REQUEST,
      overrideMessage: '"OrderCode" is required',
    });
  }

  const validOrder = [
    'picking',
    'money_collect_picking',
    'picked',
    'storing',
    'transporting',
    'lost',
    'damage',
    'delivering',
    'money_collect_delivering',
    'delivered',
    'cancel',
    'delivery_fail',
    'return',
    'return_fail',
    'returned',
    'exception',
  ];
  if (!validOrder.includes(Status)) {
    throw HttpException.new({
      code: Code.BAD_REQUEST,
      overrideMessage: 'Invalid order "Status", order must in ' + JSON.stringify(validOrder),
    });
  }

  const orderExisted = await getOrderByIdService(OrderCode);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  if (
    orderExisted.orderStatusHistory[0].status === ORDER_STATUS.CANCELLED ||
    orderExisted.orderStatusHistory[0].status === ORDER_STATUS.COMPLETED
  ) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Can not update status any more' });
  }

  switch (Status) {
    case 'picking':
    case 'money_collect_picking':
    case 'picked':
    case 'storing':
    case 'transporting':
    case 'sorting':
    case 'delivering':
    case 'money_collect_delivering':
      if (orderExisted.orderStatusHistory[0].status !== ORDER_STATUS.READY_TO_PICK) {
        throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid current order status' });
      }
      await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.SHIPPING);
      // Notify client
      await notifyClientsOfShippingOrder({
        orderId: orderExisted._id,
        code: orderExisted.code,
        customerName: orderExisted.customer.name,
        total: orderExisted.total,
        trackingNumber: orderExisted.trackingNumber,
        estimatedDeliveryAt: orderExisted.estimatedDeliveryAt,
      });
      break;

    case 'delivered':
      if (orderExisted.orderStatusHistory[0].status !== ORDER_STATUS.SHIPPING) {
        throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid current order status' });
      }
      await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.COMPLETED);
      await updatePaymentByIdService(orderExisted.payment._id, { status: PAYMENT_STATUS.PAID });
      // Notify client
      await notifyClientsOfCompleteOrder({
        orderId: orderExisted._id,
        code: orderExisted.code,
        customerName: orderExisted.customer.name,
        total: orderExisted.total,
      });
      break;

    case 'cancel':
    case 'delivery_fail':
    case 'return':
    case 'returning':
    case 'return_fail':
    case 'returned':
    case 'exception':
    case 'damage':
    case 'lost':
      if (orderExisted.orderStatusHistory[0].status == ORDER_STATUS.COMPLETED) {
        throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid current order status' });
      }
      await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.CANCELLED);
      await updatePaymentByIdService(orderExisted.payment._id, { status: PAYMENT_STATUS.CANCELLED });
      // Notify client
      await notifyClientsOfCancelOrder({
        orderId: orderExisted._id,
        code: orderExisted.code,
        customerName: orderExisted.customer.name,
        total: orderExisted.total,
      });
      break;
  }

  // Clear cache
  await deleteOrderFromCache(orderExisted._id);

  return ApiResponse.success(null);
}
