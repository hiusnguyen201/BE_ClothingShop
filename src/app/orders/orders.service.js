import {
  newOrderRepository,
  addOrderStatusHistoryByIdRepository,
  getAndCountOrdersRepository,
  removeOrderByIdRepository,
  saveOrderRepository,
  getOrderByIdRepository,
  calculateTotalRevenueByDateRangeRepository,
  calculateTotalRevenueRepository,
  getSalesByDateRangeRepository,
  countNewOrderByDateRangeRepository,
  countAllOrdersRepository,
} from '#src/app/orders/orders.repository';
import { HttpException } from '#src/core/exception/http-exception';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import {
  cancelGHNOrderService,
  createGHNOrderService,
  getDistrictService,
  getProvinceService,
  getWardService,
} from '#src/modules/GHN/ghn.service';
import { Code } from '#src/core/code/Code';
import { ONLINE_PAYMENT_METHOD, PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import { LOW_STOCK_WARNING_LEVEL, ORDER_STATUS } from '#src/app/orders/orders.constant';
import { newOrderDetailRepository, saveOrderItemsRepository } from '#src/app/order-details/order-details.repository';
import {
  decreaseProductVariantsQuantityByOrderRepository,
  getProductVariantByIdRepository,
  increaseProductVariantsQuantityByOrderRepository,
} from '#src/app/product-variants/product-variants.repository';
import {
  newPaymentRepository,
  savePaymentRepository,
  updatePaymentByIdRepository,
} from '#src/app/payments/payments.repository';
import { createMomoPaymentService } from '#src/modules/online-banking/momo/momo.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { createOrderJob, orderQueueEvent } from '#src/app/orders/orders.worker';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { generateQRCodeBuffer } from '#src/utils/qrcode.util';
import { checkValidAddressService } from '#src/modules/geoapify/geoapify.service';
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
import { Assert } from '#src/core/assert/Assert';
import { getCustomerByIdRepository } from '#src/app/customers/customers.repository';
import { getDateComparisonRange, getSaleRangeByType } from '#src/app/report/report.util';

/**
 * @typedef {import("#src/app/orders/models/order.model").OrderModel} OrderModel
 * @typedef {import("#src/app/orders/dtos/create-order.dto").CreateOrderDto} CreateOrderPort
 * @typedef {import("#src/app/orders/dtos/get-list-order.dto").GetListOrderDto} GetListOrderPort
 * @typedef {import("#src/app/orders/dtos/get-order.dto").GetOrderDto} GetOrderPort
 */

/**
 * Create order
 * @param {CreateOrderPort} payload
 * @returns
 */
export async function createOrderService(payload) {
  const customer = await getCustomerByIdRepository(payload.customerId, { type: USER_TYPE.CUSTOMER });
  Assert.isTrue(customer, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' }));

  const province = await getProvinceService(payload.provinceId);
  Assert.isTrue(province, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' }));

  const district = await getDistrictService(payload.districtId, payload.provinceId);
  Assert.isTrue(district, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' }));

  const ward = await getWardService(payload.wardCode, payload.districtId);
  Assert.isTrue(ward, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' }));

  const fullAddress = `${payload.address}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
  const validAddress = await checkValidAddressService(fullAddress);
  Assert.isTrue(validAddress, HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid address' }));

  // Logic (CREATE ORDER PENDING)
  const job = await createOrderJob({
    customerId: customer._id,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    provinceName: province.ProvinceName,
    districtName: district.DistrictName,
    wardName: ward.WardName,
    address: payload.address,
    productVariants: payload.productVariants,
    paymentMethod: payload.paymentMethod,
    baseUrl: payload.baseUrl,
  });

  const order = await job.waitUntilFinished(orderQueueEvent);

  return order;
}

/**
 * Calculate order
 * @param {Array<{quantity: number, totalPrice: number}>} orderItems
 * @returns {{totalQuantity: number, subTotal: number}}
 */
export const calculateOrderService = (orderItems) => {
  const result = orderItems.reduce(
    (acc, item) => {
      acc.totalQuantity += item.quantity;
      acc.subTotal += item.totalPrice;
      return acc;
    },
    { totalQuantity: 0, subTotal: 0 },
  );

  result.totalPrice = result.subTotal + 0; // shipping;

  return result;
};

/**
 * Get all orders
 * @param {GetListOrderPort} payload
 * @returns {Promise<[number, OrderModel[]]>}
 */
export async function getAllOrdersService(payload) {
  const filters = {
    ...(payload.customerId && { customerId: payload.customerId }),
    ...(payload.status && { status: payload.status }),
    ...((payload.minTotal || payload.maxTotal) && {
      total: {
        ...(payload.minTotal && { $gte: payload.minTotal }),
        ...(payload.maxTotal && { $lte: payload.maxTotal }),
      },
    }),
    ...(payload.keyword && {
      $expr: {
        $regexMatch: {
          input: { $toString: '$code' },
          regex: payload.keyword,
          options: 'i',
        },
      },
    }),
  };

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, orders] = await getAndCountOrdersRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  return [totalCount, orders];
}

/**
 * Get recent orders
 * @param {GetRecentOrdersPort} payload
 * @returns {Promise<[number, OrderModel[]]>}
 */
export async function getRecentOrdersService(payload) {
  return await getAndCountOrdersRepository({}, 0, payload.limit, 'createdAt', 'desc');
}

/**
 * Get order
 * @param {GetOrderPort} payload
 * @returns {Promise<OrderModel>}
 */
export async function getOrderByIdService(payload) {
  const order = await getOrderByIdRepository(payload.orderId);

  Assert.isTrue(order, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }));

  return order;
}

export async function createOrderLogicService(data) {
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
    const newOrder = newOrderRepository({
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
        const variantExisted = await getProductVariantByIdRepository(variant.id);
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

        const orderDetail = newOrderDetailRepository({
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
    await decreaseProductVariantsQuantityByOrderRepository(
      orderItems.map((item) => ({ variantId: item.variant, quantity: item.quantity })),
      session,
    );

    // Save order items
    await saveOrderItemsRepository(orderItems, session);
    newOrder.orderDetails = orderItems.map((item) => item._id);

    // Calculate order
    const calculation = calculateOrderService(orderItems);
    newOrder.quantity = calculation.totalQuantity;
    newOrder.subTotal = calculation.subTotal;
    newOrder.total = calculation.totalPrice;

    // Create payment instance
    const newPayment = newPaymentRepository({
      order: newOrder._id,
      paymentMethod,
      status: PAYMENT_STATUS.PENDING,
    });
    newOrder.payment = newPayment._id;

    // Save order
    const insertResult = await saveOrderRepository(newOrder, session);

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

    await savePaymentRepository(newPayment, session);

    return insertResult;
  });

  await Promise.all(warningLowStockProductVariants.map(notifyClientsOfLowStock));

  // Notify
  await notifyClientsOfNewOrder({
    orderId: result._id,
    code: result.code,
    total: result.total,
  });

  return result;
}

export async function confirmOrderService(payload) {
  const orderExisted = await getOrderByIdRepository(payload.orderId);
  Assert.isTrue(orderExisted, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }));

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  Assert.isTrue(
    currentStatus === ORDER_STATUS.PENDING,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid order status' }),
  );

  await addOrderStatusHistoryByIdRepository(orderExisted._id, ORDER_STATUS.CONFIRMED);

  // Notify
  await notifyClientsOfConfirmOrder({
    orderId: orderExisted._id,
    code: orderExisted.code,
    customerName: orderExisted.customer.name,
    total: orderExisted.total,
  });

  return await getOrderByIdRepository(orderExisted._id);
}

export async function processingOrderService(payload) {
  const orderExisted = await getOrderByIdRepository(payload.orderId);
  Assert.isTrue(orderExisted, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }));

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  Assert.isTrue(
    currentStatus === ORDER_STATUS.CONFIRMED,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid order status' }),
  );

  await addOrderStatusHistoryByIdRepository(orderExisted._id, ORDER_STATUS.PROCESSING);

  // Notify
  await notifyClientsOfProcessingOrder({
    orderId: orderExisted._id,
    code: orderExisted.code,
    customerName: orderExisted.customer.name,
    total: orderExisted.total,
  });

  return await getOrderByIdRepository(orderExisted._id);
}

export async function cancelOrderService(payload) {
  const orderExisted = await getOrderByIdRepository(payload.orderId);
  Assert.isTrue(orderExisted, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }));

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  Assert.isFalse(
    [ORDER_STATUS.SHIPPING, ORDER_STATUS.COMPLETED, PAYMENT_STATUS.PAID].includes(currentStatus),
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Invalid order status' }),
  );

  await TransactionalServiceWrapper.execute(async (session) => {
    // Increase quantity of product variants
    await increaseProductVariantsQuantityByOrderRepository(
      orderExisted.orderDetails.map((item) => ({ quantity: item.quantity, variantId: item.variant._id })),
      session,
    );

    // refund
    // if (orderExisted.payment.status === PAYMENT_STATUS.PAID) {
    // const result = await refundMomoPaymentService(orderExisted._id, orderExisted.payment);
    // if (!result) {
    //   throw HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Refund payment failed' });
    // }
    // await updatePaymentByIdService(orderExisted.payment._id, { status: PAYMENT_STATUS.REFUND }, session);
    // } else {
    await updatePaymentByIdRepository(orderExisted.payment._id, { status: PAYMENT_STATUS.CANCELLED }, session);
    // }

    // Remove shipping order
    if (orderExisted.trackingNumber) {
      const result = await cancelGHNOrderService(orderExisted.trackingNumber);
      if (!result) {
        throw HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Cancel shipping order failed' });
      }
    }

    await addOrderStatusHistoryByIdRepository(orderExisted._id, ORDER_STATUS.CANCELLED);
  });

  // Notify
  await notifyClientsOfCancelOrder({
    orderId: orderExisted._id,
    code: orderExisted.code,
    customerName: orderExisted.customer.name,
    total: orderExisted.total,
  });

  return await getOrderByIdRepository(orderExisted._id);
}

export async function createShippingOrderService(payload) {
  const orderExisted = await getOrderByIdRepository(payload.orderId);
  Assert.isTrue(orderExisted, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }));

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  Assert.isTrue(
    currentStatus === ORDER_STATUS.PROCESSING,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid order status' }),
  );

  const newOrderGhn = await createGHNOrderService(orderExisted);
  Assert.isTrue(
    newOrderGhn && newOrderGhn.code == 200,
    HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Create order ship failed' }),
  );

  await addOrderStatusHistoryByIdRepository(orderExisted._id, ORDER_STATUS.READY_TO_PICK, {
    trackingNumber: newOrderGhn.data.order_code,
    estimatedDeliveryAt: newOrderGhn.data.expected_delivery_time,
  });

  // Notify
  await notifyClientsOfReadyForPickupOrder({
    orderId: orderExisted._id,
    code: orderExisted.code,
    customerName: orderExisted.customer.name,
    total: orderExisted.total,
  });

  return await getOrderByIdRepository(orderExisted._id);
}

export async function removeOrderByIdService(payload) {
  const orderExisted = await getOrderByIdRepository(payload.orderId);
  Assert.isTrue(orderExisted, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }));

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  Assert.isTrue(
    currentStatus === ORDER_STATUS.PENDING,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid order status' }),
  );

  await TransactionalServiceWrapper.execute(async (session) => {
    await increaseProductVariantsQuantityByOrderRepository(
      orderExisted.orderDetails.map((item) => ({ quantity: item.quantity, variantId: item.variant._id })),
      session,
    );
    await removeOrderByIdRepository(orderExisted._id, session);
  });

  return { id: orderExisted._id };
}

/**
 * Webhook order status
 * @param {WebHookOrderStatusDto} payload
 * @returns {Promise<void>}
 */
export async function webHookUpdateOrderService(payload) {
  const orderExisted = await getOrderByIdRepository(payload.orderId);
  Assert.isTrue(orderExisted, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }));

  const currentStatus = orderExisted.orderStatusHistory[0].status;
  Assert.isTrue(
    currentStatus !== ORDER_STATUS.CANCELLED && currentStatus !== ORDER_STATUS.COMPLETED,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Can not update status any more' }),
  );

  switch (payload.status) {
    case 'picking':
    case 'money_collect_picking':
    case 'picked':
    case 'storing':
    case 'transporting':
    case 'sorting':
    case 'delivering':
    case 'money_collect_delivering':
      Assert.isTrue(
        currentStatus === ORDER_STATUS.READY_TO_PICK,
        HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid current order status' }),
      );

      await addOrderStatusHistoryByIdRepository(orderExisted._id, ORDER_STATUS.SHIPPING);

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
      Assert.isTrue(
        currentStatus === ORDER_STATUS.SHIPPING,
        HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid current order status' }),
      );

      await addOrderStatusHistoryByIdRepository(orderExisted._id, ORDER_STATUS.COMPLETED);
      await updatePaymentByIdRepository(orderExisted.payment._id, { status: PAYMENT_STATUS.PAID });

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
      Assert.isTrue(
        currentStatus === ORDER_STATUS.COMPLETED,
        HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid current order status' }),
      );

      await addOrderStatusHistoryByIdRepository(orderExisted._id, ORDER_STATUS.CANCELLED);
      await updatePaymentByIdRepository(orderExisted.payment._id, { status: PAYMENT_STATUS.CANCELLED });

      // Notify client
      await notifyClientsOfCancelOrder({
        orderId: orderExisted._id,
        code: orderExisted.code,
        customerName: orderExisted.customer.name,
        total: orderExisted.total,
      });
      break;
  }
}

export async function getAllOrdersInCustomerService(payload) {
  const filters = {
    customer: payload.customerId,
    ...(payload.status ? { status: payload.status } : {}),
  };

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, orders] = await getAndCountOrdersRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  return [totalCount, orders];
}

/**
 * Get order report by date range
 * @param {GetCustomerReportDto} payload
 * @returns
 */
export async function getOrderReportByDateRangeService(payload) {
  const { current, previous } = getDateComparisonRange(payload.compareTo);

  const currentCountNewOrder = await countNewOrderByDateRangeRepository(current.start, current.end);
  const previousCountNewOrder = await countNewOrderByDateRangeRepository(previous.start, previous.end);
  const totalOrderOverall = await countAllOrdersRepository();

  const percentage =
    currentCountNewOrder && previousCountNewOrder
      ? ((currentCountNewOrder - previousCountNewOrder) / previousCountNewOrder) * 100
      : 0;

  return {
    totalOrderOverall,
    currentCountNewOrder,
    previousCountNewOrder,
    percentage: percentage.toFixed(1),
  };
}

/**
 * Get revenue report by date range
 * @param {GetRevenueReportDto} payload
 * @returns
 */
export async function getRevenueReportByDateRangeService(payload) {
  const { current, previous } = getDateComparisonRange(payload.compareTo);

  const currentTotalRevenue = await calculateTotalRevenueByDateRangeRepository(current.start, current.end);
  const previousTotalRevenue = await calculateTotalRevenueByDateRangeRepository(previous.start, previous.end);
  const totalRevenueOverall = await calculateTotalRevenueRepository();

  const percentage =
    currentTotalRevenue && previousTotalRevenue
      ? ((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
      : 0;

  return {
    totalRevenueOverall,
    currentTotalRevenue,
    previousTotalRevenue,
    percentage: percentage.toFixed(1),
  };
}

/**
 * Get sales report by date range
 * @param {GetSalesReportDto} payload
 * @returns {Promise<Array<{ timestamp: string, sales: number }>>}
 */
export async function getSalesReportByDateRangeService(payload) {
  const { start, end, unit } = getSaleRangeByType(payload.type);
  return await getSalesByDateRangeRepository(start, end, unit);
}
