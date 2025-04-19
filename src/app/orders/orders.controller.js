import {
  getOrderByIdService,
  newOrderService,
  updateOrderStatusByIdService,
  getAndCountOrdersService,
  updateOrderByIdService,
  removeOrderByIdService,
  calculateOrderService,
  saveOrderService,
} from '#src/app/orders/orders.service';
import { HttpException } from '#src/core/exception/http-exception';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import moment from 'moment-timezone';
import { createGhnOrder, getOrderGhnByClientOrderCode, removeOrderGhn } from '#src/modules/GHN/ghn.service';
import { Code } from '#src/core/code/Code';
import { ONLINE_PAYMENT_METHOD } from '#src/app/payments/payments.constant';
import { ORDERS_STATUS } from '#src/app/orders/orders.constant';
import {
  createOrderDetailService,
  getListOrderDetailsByOrderIdService,
  getOrderDetailsByOrderIdService,
  newOrderDetailService,
  removeOrderDetailByOrderIdService,
  saveOrderItemsService,
} from '#src/app/order-details/order-details.service';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { OrderDto } from '#src/app/orders/dtos/order.dto';
import {
  getProductVariantByIdService,
  saveProductVariantService,
} from '#src/app/product-variants/product-variants.service';
import { updateCancelOrderQuantityProductUtil } from '#src/utils/handle-create-order';
import {
  getPaymentByIdService,
  newPaymentService,
  savePaymentService,
  updatePaymentByIdService,
} from '#src/app/payments/payments.service';
import { createMomoPaymentService } from '#src/modules/online-banking/momo/momo.service';
import {
  createOrderStatusHistoryService,
  getOrderStatusHistoryByTrackingIdService,
  newOrderStatusHistoryService,
  saveOrderStatusHistoryService,
} from '#src/app/order-status-history/order-status-history.service';
import {
  checkValidAddressService,
  getDistrictByCodeService,
  getProvinceByCodeService,
  getWardByCodeService,
} from '#src/app/divisions/divisions.service';
import { getUserByIdService } from '#src/app/users/users.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { createOrderJob, orderQueueEVent } from '#src/app/orders/orders.worker';

export async function getAllOrdersController(req) {
  const { customerId, limit, page, sortBy, sortOrder, status } = req.query;

  const filters = {
    ...(customerId ? { customerId: customerId } : {}),
    ...(status ? { status: status } : {}),
  };

  const skip = (page - 1) * limit;
  const [totalCount, orders] = await getAndCountOrdersService(filters, skip, limit, sortBy, sortOrder);

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success({ totalCount, list: ordersDto });
}

export async function createOrderController(req) {
  const {
    customerId,
    address,
    provinceCode,
    districtCode,
    wardCode,
    customerName,
    customerEmail,
    customerPhone,
    productVariants,
    paymentMethod,
  } = req.body;

  // Validation
  const customer = await getUserByIdService(customerId, { type: USER_TYPE.CUSTOMER });
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const province = getProvinceByCodeService(provinceCode);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const district = getDistrictByCodeService(districtCode);
  if (!district || district.province_code !== provinceCode) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const ward = getWardByCodeService(wardCode);
  if (!ward || ward.district_code !== districtCode) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' });
  }

  const validAddress = await checkValidAddressService(address, ward.name, district.name, province.name);
  if (!validAddress) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid address' });
  }

  // Logic (CREATE ORDER PENDING)
  const job = await createOrderJob({
    customerId: customer._id,
    customerName: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    provinceName: province.name,
    districtName: district.name,
    wardName: ward.name,
    address: address,
    productVariants: productVariants,
    paymentMethod: paymentMethod,
  });
  const newOrder = await job.waitUntilFinished(orderQueueEVent);

  // Transform
  const orderDto = ModelDto.new(OrderDto, newOrder);
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
      assignedTo,
    } = data;

    // Create order instance
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
    });

    // Create order history instance (PENDING)
    const newOrderHistory = newOrderStatusHistoryService({
      status: ORDERS_STATUS.PENDING,
      order: newOrder._id,
      assignedTo,
    });
    newOrder.orderStatusHistory.push(newOrderHistory);

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

        variantExisted.quantity = variantExisted.quantity - variant.quantity;
        await saveProductVariantService(variantExisted, session);
        return orderDetail;
      }),
    );
    newOrder.orderDetails = orderItems;

    // Calculate order
    const calculation = calculateOrderService(orderItems);
    newOrder.quantity = calculation.totalQuantity;
    newOrder.subTotal = calculation.subTotal;
    newOrder.totalPrice = calculation.totalPrice;

    // Create payment instance
    const newPayment = newPaymentService({
      order: newOrder._id,
      paymentMethod,
    });
    newOrder.payment = newPayment;

    // Save order
    const insertResult = await saveOrderService(newOrder, session);

    // Handle payment method
    switch (newPayment.paymentMethod) {
      case ONLINE_PAYMENT_METHOD.MOMO:
        const momoResponse = await createMomoPaymentService(insertResult.code, newOrder.total);
        newPayment.paymentUrl = momoResponse.payUrl;
        newPayment.qrCodeUrl = momoResponse.qrCodeUrl;

        const newOrderHistory = newOrderStatusHistoryService({
          status: ORDERS_STATUS.PENDING_PAYMENT,
          order: newOrder._id,
        });

        newOrder.orderStatusHistory.push(newOrderHistory);
        await updateOrderByIdService(newOrder._id, { orderStatusHistory: newOrder.orderStatusHistory }, session);

        break;
    }

    // Save order history
    await saveOrderStatusHistoryService(newOrderHistory, session);
    // Save order items
    await saveOrderItemsService(orderItems, session);
    // Save payment
    await savePaymentService(newPayment, session);

    return { ...newOrder.toObject(), code: insertResult.code };
  });
}

export async function confirmOrderController(req) {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId, '_id');
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status !== ORDERS_STATUS.PENDING) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    if (!orderExisted.payment) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
    }

    const newOrderStatus = ORDERS_STATUS.CONFIRMED;

    const newOrderHistory = await createOrderStatusHistoryService(
      {
        status: newOrderStatus,
        order: orderExisted._id,
        // assignedTo: id,,
      },
      session,
    );

    const updatedOrder = await updateOrderStatusByIdService(
      orderExisted._id,
      newOrderStatus,
      newOrderHistory[0]._id,
      session,
    );

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

export async function createShippingOrderController(req) {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId, '_id');
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status !== ORDERS_STATUS.PROCESSING) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    if (!orderExisted.payment) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
    }

    const newOrderStatus = ORDERS_STATUS.WAITING_FOR_PICKUP;

    const orderDetails = await getOrderDetailsByOrderIdService(orderExisted._id);
    const newOrderGhn = await createGhnOrder(orderExisted, orderDetails);

    if (!newOrderGhn || newOrderGhn?.code != 200) {
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Create shipping order false' });
    }

    const newOrderHistory = await createOrderStatusHistoryService(
      {
        status: newOrderStatus,
        shippingCarrier: 'GHN',
        trackingNumber: newOrderGhn.data.order_code,
        expectedShipDate: newOrderGhn.data.expected_delivery_time,
        order: orderExisted._id,
        // assignedTo: id,,
      },
      session,
    );

    const updatedOrder = await updateOrderStatusByIdService(
      orderExisted._id,
      newOrderStatus,
      newOrderHistory[0]._id,
      session,
    );

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

export async function webHookUpdateOrder(req) {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { CODAmount, Time, OrderCode, Status } = req.body;

    const orderStatusHistory = await getOrderStatusHistoryByTrackingIdService(OrderCode);

    const orderExisted = await getOrderByIdService(orderStatusHistory.order, '_id');
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    const validStatuses = [ORDERS_STATUS.WAITING_FOR_PICKUP, ORDERS_STATUS.SHIPPING];

    if (!validStatuses.includes(orderExisted.status)) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    const statusMap = {
      picked: ORDERS_STATUS.SHIPPING,
      delivered: ORDERS_STATUS.DELIVERED,
      return: ORDERS_STATUS.CANCELLED,
    };

    const newOrderStatus = statusMap[Status];
    if (!newOrderStatus) {
      return ApiResponse.success();
    }

    const newOrderHistory = await createOrderStatusHistoryService(
      {
        status: newOrderStatus,
        shippingCarrier: 'GHN',
        trackingNumber: orderStatusHistory.trackingNumber,
        expectedShipDate: orderStatusHistory.expectedShipDate,
        order: orderExisted._id,
        // assignedTo: id,,
      },
      session,
    );

    if (newOrderStatus === ORDERS_STATUS.DELIVERED) {
      const payment = await getPaymentByIdService(orderExisted.payment);
      if (!payment) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
      }
      if ((payment.paymentMethod === PAYMENT_METHOD.COD && CODAmount) || Time) {
        await updatePaymentByIdService(
          payment._id,
          {
            ...(CODAmount ? { amountPaid: CODAmount } : {}),
            ...(Time ? { paidDate: Time } : {}),
          },
          session,
        );
      }
    }

    if (newOrderStatus === ORDERS_STATUS.CANCELLED) {
      await updateCancelOrderQuantityProductUtil(orderExisted._id, session);
    }

    const updatedOrder = await updateOrderStatusByIdService(
      orderExisted._id,
      newOrderStatus,
      newOrderHistory[0]._id,
      session,
    );

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

export async function cancelOrderController(req) {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId, '_id');
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status === ORDERS_STATUS.CANCELLED || orderExisted.status === ORDERS_STATUS.DELIVERED) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Invalid order status' });
    }

    if (orderExisted.status === ORDERS_STATUS.SHIPPING) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order is shipping can not cancel' });
    }

    const newOrderStatus = ORDERS_STATUS.CANCELLED;

    const newOrderHistory = await createOrderStatusHistoryService(
      {
        status: newOrderStatus,
        order: orderExisted._id,
        // assignedTo: id,,
      },
      session,
    );

    await updateCancelOrderQuantityProductUtil(orderExisted._id, session);

    if (orderExisted?.payment?.paidDate) {
      // refund
    }

    const updatedOrder = await updateOrderStatusByIdService(
      orderExisted._id,
      newOrderStatus,
      newOrderHistory[0]._id,
      session,
    );

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

// export async function cancelOrderByCustomerController  (req)  {
//   return TransactionalServiceWrapper.execute(async (session) => {
//     const { id } = req.user;
//     const { orderId } = req.body;

//     const orderExisted = await getOrderByIdService(orderId, { customerId: id });
//     if (!orderExisted) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
//     }

//     if (orderExisted.status === ORDERS_STATUS.CANCELLED || orderExisted.status === ORDERS_STATUS.DELIVERED) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Invalid order status' });
//     }

//     if (orderExisted.status === ORDERS_STATUS.SHIPPING) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order is shipping can not cancel' });
//     }

//     const newOrderStatus = ORDERS_STATUS.CANCELLED;

//     const newOrderHistory = await createOrderStatusHistoryService(
//       {
//         status: newOrderStatus,
//         order: orderExisted._id,
//         // assignedTo: id,
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

export async function getOrderByIdController(req) {
  const { orderId } = req.params;
  const order = await getOrderByIdService(orderId);
  if (!order) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
}

// export async function getOrderByCustomerIdController  (req)  {
//   const { id } = req.user;
//   const { orderId } = req.params;
//   const order = await getOrderByIdService(orderId, { customerId: id });
//   if (!order) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
//   }
//   const orderDto = ModelDto.new(OrderDto, order);
//   return ApiResponse.success(orderDto);
// };

export async function updateOrderController(req) {
  return TransactionalServiceWrapper.execute(async (session) => {
    // const { id } = req.user;
    const { orderId } = req.params;
    const { customerName, customerEmail, customerPhone, customerAddress, productVariants, paymentMethod } = req.body;

    const orderExisted = await getOrderByIdService(orderId, '_id');
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status !== ORDERS_STATUS.PENDING) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    if (orderExisted.payUrl) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Can not update' });
    }

    await updateCancelOrderQuantityProductUtil(orderExisted._id, session);
    await removeOrderDetailByOrderIdService(orderExisted._id, session);

    const order = {
      customerName,
      customerEmail,
      customerPhone,
      provinceName: customerAddress.province,
      districtName: customerAddress.district,
      wardName: customerAddress.ward,
      address: customerAddress.address,
    };

    const orderDetails = await Promise.all(
      productVariants.map(async (productVariant) => {
        const productVariantExited = await getProductVariantByIdService(productVariant.variantId);
        if (!productVariantExited) {
          throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
        }
        if (productVariantExited.quantity < productVariant.quantity) {
          throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Product variant quantity not enough' });
        }

        let productVariantPrice = productVariantExited.price;

        const orderDetail = newOrderDetailService({
          quantity: productVariant.quantity,
          unitPrice: productVariantPrice,
          order: orderExisted._id,
          product: productVariantExited.product,
          variant: productVariantExited._id,
        });

        orderDetail.totalPrice = orderDetail.unitPrice * productVariant.quantity;
        productVariantExited.quantity = productVariantExited.quantity - productVariant.quantity;

        await productVariantExited.save({ session });
        await orderDetail.save({ session });
        return orderDetail;
      }),
    );

    const calcResult = orderDetails.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.totalPriceSum += item.totalPrice;
        return acc;
      },
      { totalQuantity: 0, totalPriceSum: 0 },
    );

    order.quantity = calcResult.totalQuantity;
    const subTotal = calcResult.totalPriceSum;
    order.subTotal = subTotal;
    order.total = subTotal + orderExisted.shippingFee;

    await updateOrderByIdService(orderExisted._id, order, session);

    const newOrderStatus = ORDERS_STATUS.PENDING;
    const newOrderHistory = await createOrderStatusHistoryService(
      {
        status: newOrderStatus,
        order: orderExisted._id,
        // assignedTo: id,,
      },
      session,
    );

    const updatedOrder = await updateOrderStatusByIdService(
      orderExisted._id,
      newOrderStatus,
      newOrderHistory[0]._id,
      session,
    );

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

export async function removeOrderController(req) {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.params;

    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status !== ORDERS_STATUS.PENDING) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    await updateCancelOrderQuantityProductUtil(orderExisted._id, session);
    const removedOrder = await removeOrderByIdService(orderExisted._id);

    return ApiResponse.success({ id: removedOrder._id });
  });
}

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
