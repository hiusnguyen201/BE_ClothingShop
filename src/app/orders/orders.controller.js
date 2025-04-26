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
import { ORDER_STATUS } from '#src/app/orders/orders.constant';
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
import { getUserByIdService } from '#src/app/users/users.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { createOrderJob, orderQueueEVent } from '#src/app/orders/orders.worker';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { generateQRCodeBuffer } from '#src/utils/qrcode.util';
import { checkValidAddressService } from '#src/modules/geoapify/geoapify.service';
import { validateSchema } from '#src/core/validations/request.validation';
import { CreateOrderDto } from '#src/app/orders/dtos/create-order.dto';
import { GetListOrderDto } from '#src/app/orders/dtos/get-list-order.dto';
import { GetOrderDto } from '#src/app/orders/dtos/get-order.dto';
import { CreateOrderGhnDto } from '#src/app/orders/dtos/create-order-ghn.dto';
import { CreateOrderCustomerDto } from '#src/app/orders/dtos/create-order-customer.';
// import { UpdateOrderDto } from '#src/app/orders/dtos/update-order.dto';

export async function createOrderController(req) {
  const adapter = await validateSchema(CreateOrderDto, req.body);

  // Validation
  const customer = await getUserByIdService(adapter.customerId, { type: USER_TYPE.CUSTOMER });
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const province = await getProvinceService(adapter.provinceCode);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const district = await getDistrictService(adapter.districtCode, adapter.provinceCode);
  if (!district) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const ward = await getWardService(adapter.wardCode, adapter.districtCode);
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
  const newOrder = await job.waitUntilFinished(orderQueueEVent);

  // Transform
  const orderDetail = await getOrderByIdService(newOrder._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);
  return ApiResponse.success(orderDto);
}

export async function createOrderByCustomerController(req) {
  const { id } = req.user;

  const adapter = await validateSchema(CreateOrderCustomerDto, req.body);

  // Validation
  const customer = await getUserByIdService(id, { type: USER_TYPE.CUSTOMER });
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const province = await getProvinceService(adapter.provinceCode);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const district = await getDistrictService(adapter.districtCode, adapter.provinceCode);
  if (!district) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const ward = await getWardService(adapter.wardCode, adapter.districtCode);
  if (!ward) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' });
  }

  const fullAddress = `${adapter.address}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;

  // const validAddress = await checkValidAddressService(fullAddress);
  // if (!validAddress) {
  //   throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid address' });
  // }

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
  const newOrder = await job.waitUntilFinished(orderQueueEVent);

  // Transform
  const orderDetail = await getOrderByIdService(newOrder._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);
  return ApiResponse.success(orderDto);
}

export async function getAllOrdersController(req) {
  const adapter = await validateSchema(GetListOrderDto, req.query);

  const filters = {
    ...(adapter.customerId ? { customerId: adapter.customerId } : {}),
    ...(adapter.status ? { status: adapter.status } : {}),
    keyword: adapter.keyword,
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, orders] = await getAndCountOrdersService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success({ totalCount, list: ordersDto });
}

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

  const order = await getOrderByIdService(adapter.orderId);
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
  return TransactionalServiceWrapper.execute(async (session) => {
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

  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);
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

  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);
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
      console.log(result);
      if (!result) {
        throw HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Cancel shipping order failed' });
      }
    }

    await addOrderStatusHistoryByIdService(orderExisted._id, ORDER_STATUS.CANCELLED);
  });

  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);
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
  });

  const orderDetail = await getOrderByIdService(orderExisted._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);
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

  return ApiResponse.success({ id: orderExisted._id });
}

// export async function webHookUpdateOrder(req) {
//   return TransactionalServiceWrapper.execute(async (session) => {
//     const { CODAmount, Time, OrderCode, Status } = req.body;

//     const orderStatusHistory = await getOrderStatusHistoryByTrackingIdService(OrderCode);

//     const orderExisted = await getOrderByIdService(orderStatusHistory.order, '_id');
//     if (!orderExisted) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
//     }

//     const validStatuses = [ORDER_STATUS.WAITING_FOR_PICKUP, ORDER_STATUS.SHIPPING];

//     if (!validStatuses.includes(orderExisted.orderStatusHistory[0].status)) {
//       throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
//     }

//     const statusMap = {
//       picked: ORDER_STATUS.SHIPPING,
//       delivered: ORDER_STATUS.COMPLETED,
//       return: ORDER_STATUS.CANCELLED,
//     };

//     const newOrderStatus = statusMap[Status];
//     if (!newOrderStatus) {
//       return ApiResponse.success();
//     }

//     const newOrderHistory = await createOrderStatusHistoryService(
//       {
//         status: newOrderStatus,
//         trackingNumber: orderStatusHistory.trackingNumber,
//         order: orderExisted._id,
//       },
//       session,
//     );

//     if (newOrderStatus === ORDER_STATUS.COMPLETED) {
//       const payment = await getPaymentByIdService(orderExisted.payment);
//       if (!payment) {
//         throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
//       }
//       if ((payment.paymentMethod === PAYMENT_METHOD.COD && CODAmount) || Time) {
//         await updatePaymentByIdService(
//           payment._id,
//           {
//             ...(CODAmount ? { amountPaid: CODAmount } : {}),
//             ...(Time ? { paidDate: Time } : {}),
//           },
//           session,
//         );
//       }
//     }

//     if (newOrderStatus === ORDER_STATUS.CANCELLED) {
//       // await updateCancelOrderQuantityProductUtil(orderExisted._id, session);
//     }

//     const updatedOrder = await updateOrderStatusByIdService(
//       orderExisted._id,
//       newOrderStatus,
//       newOrderHistory[0]._id,
//       session,
//     );

//     const orderDto = ModelDto.new(OrderDto, updatedOrder);
//     return ApiResponse.success(orderDto);
//   });
// }

// export async function cancelOrderByCustomerController  (req)  {
//   return TransactionalServiceWrapper.execute(async (session) => {
//     const { id } = req.user;
//     const { orderId } = req.body;

//     const orderExisted = await getOrderByIdService(orderId, { customerId: id });
//     if (!orderExisted) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
//     }

//     if (orderExisted.status === ORDER_STATUS.CANCELLED || orderExisted.status === ORDER_STATUS.DELIVERED) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Invalid order status' });
//     }

//     if (orderExisted.status === ORDER_STATUS.SHIPPING) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order is shipping can not cancel' });
//     }

//     const newOrderStatus = ORDER_STATUS.CANCELLED;

//     const newOrderHistory = await createOrderStatusHistoryService(
//       {
//         status: newOrderStatus,
//         order: orderExisted._id,
//       },
//       session,
//     );

//     await updateCancelOrderQuantityProductUtil(orderExisted._id, session);

//     if (orderExisted?.payment?.paidDate) {
//       // refund
//     }

//     const updatedOrder = await updateOrderStatusByIdService(
//       orderExisted._id,
//       newOrderStatus,
//       newOrderHistory[0]._id,
//       session,
//     );

//     const orderDto = ModelDto.new(OrderDto, updatedOrder);
//     return ApiResponse.success(orderDto);
//   });
// };

// export async function getAllOrdersByCustomerIdController  (req)  {
//   const { id } = req.user;
//   const { code, limit, page, sortBy, sortOrder } = req.query;

//   const filters = {
//     customerId: id,
//     ...(code ? { code: code } : {}),
//   };

//   const totalCount = await countAllOrdersService(filters);
//   const orders = await getAllOrdersService({
//     filters: filters,
//     page,
//     limit,
//     sortBy,
//     sortOrder,
//   });

//   const ordersDto = ModelDto.newList(OrderDto, orders);
//   return ApiResponse.success({ totalCount, list: ordersDto });
// };

// export async function updateOrderController(req) {
//   return TransactionalServiceWrapper.execute(async (session) => {
//     // const { id } = req.user;
//     const { orderId } = req.params;
//     const { customerName, customerEmail, customerPhone, customerAddress, productVariants, paymentMethod } = req.body;

//     const orderExisted = await getOrderByIdService(orderId, '_id');
//     if (!orderExisted) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
//     }

//     if (orderExisted.status !== ORDER_STATUS.PENDING) {
//       throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
//     }

//     if (orderExisted.payUrl) {
//       throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Can not update' });
//     }

//     // await updateCancelOrderQuantityProductUtil(orderExisted._id, session);
//     await removeOrderDetailByOrderIdService(orderExisted._id, session);

//     const order = {
//       customerName,
//       customerEmail,
//       customerPhone,
//       provinceName: customerAddress.province,
//       districtName: customerAddress.district,
//       wardName: customerAddress.ward,
//       address: customerAddress.address,
//     };

//     const orderDetails = await Promise.all(
//       productVariants.map(async (productVariant) => {
//         const productVariantExited = await getProductVariantByIdService(productVariant.variantId);
//         if (!productVariantExited) {
//           throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
//         }
//         if (productVariantExited.quantity < productVariant.quantity) {
//           throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Product variant quantity not enough' });
//         }

//         let productVariantPrice = productVariantExited.price;

//         const orderDetail = newOrderDetailService({
//           quantity: productVariant.quantity,
//           unitPrice: productVariantPrice,
//           order: orderExisted._id,
//           product: productVariantExited.product,
//           variant: productVariantExited._id,
//         });

//         orderDetail.totalPrice = orderDetail.unitPrice * productVariant.quantity;
//         productVariantExited.quantity = productVariantExited.quantity - productVariant.quantity;

//         await productVariantExited.save({ session });
//         await orderDetail.save({ session });
//         return orderDetail;
//       }),
//     );

//     const calcResult = orderDetails.reduce(
//       (acc, item) => {
//         acc.totalQuantity += item.quantity;
//         acc.totalPriceSum += item.totalPrice;
//         return acc;
//       },
//       { totalQuantity: 0, totalPriceSum: 0 },
//     );

//     order.quantity = calcResult.totalQuantity;
//     const subTotal = calcResult.totalPriceSum;
//     order.subTotal = subTotal;
//     order.total = subTotal + orderExisted.shippingFee;

//     await updateOrderByIdService(orderExisted._id, order, session);

//     const newOrderStatus = ORDER_STATUS.PENDING;
//     const newOrderHistory = await createOrderStatusHistoryService(
//       {
//         status: newOrderStatus,
//         order: orderExisted._id,
//       },
//       session,
//     );

//     const updatedOrder = await updateOrderStatusByIdService(
//       orderExisted._id,
//       newOrderStatus,
//       newOrderHistory[0]._id,
//       session,
//     );

//     const orderDto = ModelDto.new(OrderDto, updatedOrder);
//     return ApiResponse.success(orderDto);
//   });
// }

/////////////////
// export async function cancelExpiredOrders() {
//   const now = moment(); // Thời gian hiện tại
//   const expirationThreshold = now.clone().subtract(24, 'hours'); // Thời điểm cách 24 giờ trước

//   // Lọc các đơn hàng Pending quá 24 giờ
//   const expiredOrders = await OrderModel.find({
//     status: 'Pending',
//     createdAt: { $lte: expirationThreshold.toDate() }, // createdAt <= 24h trước
//   });

//   if (expiredOrders.length === 0) {
//     console.log('Không có đơn hàng nào quá hạn.');
//     return;
//   }

//   // Cập nhật trạng thái thành Cancelled
//   const orderIds = expiredOrders.map((order) => order._id);
//   await OrderModel.updateMany({ _id: { $in: orderIds } }, { status: 'Cancelled', updatedAt: new Date() });
//   console.log(`Đã hủy ${expiredOrders.length} đơn hàng quá hạn.`);
// }
