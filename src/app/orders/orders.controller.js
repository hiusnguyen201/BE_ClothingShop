import {
  getOrderByIdService,
  countAllOrdersService,
  newOrderService,
  updateOrderStatusByIdService,
  getAllOrdersService,
} from '#src/app/orders/orders.service';
import { HttpException } from '#src/core/exception/http-exception';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import moment from 'moment-timezone';
import {
  createGhnOrder,
  getOrderGhnByClientOrderCode,
  removeOrderGhn
} from '#src/modules/GHN/ghn.service';
import { Code } from '#src/core/code/Code';
import { ORDERS_STATUS, PAYMENT_METHOD } from '#src/core/constant';
import {
  getOrderDetailsByOrderIdService,
  newOrderDetailService
} from '#src/app/order-details/order-details.service';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { OrderDto } from '#src/app/orders/dtos/order.dto';
import { getProductVariantByIdService } from '#src/app/product-variants/product-variants.service';
import { randomCodeOrder } from '#src/utils/string.util';
import {
  calculateDiscount,
  updateCancelOrderQuantityProductUtil
} from '#src/utils/handle-create-order';
import {
  getPaymentByIdService,
  newPaymentService,
  updatePaymentByIdService
} from '#src/app/payments/payments.service';
import { createMomoPayment } from '#src/utils/paymentMomo';
import {
  createOrderStatusHistoryService,
  getOrderStatusHistoryByTrackingIdService,
  newOrderStatusHistoryService
} from '#src/app/order-status-history/order-status-history.service';

export const createOrderController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      productVariants,
      paymentMethod } = req.body;

    const newOrder = newOrderService({
      code: randomCodeOrder(14),
      customerName,
      customerEmail,
      customerPhone,
      provinceName: customerAddress.province,
      districtName: customerAddress.district,
      wardName: customerAddress.ward,
      address: customerAddress.address,
      orderDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      shippingDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      shippingFee: 0,
      isPaid: false,
      status: ORDERS_STATUS.PENDING
    });

    const orderDetails = await Promise.all(productVariants.map(async (productVariant) => {
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
        orderId: newOrder._id,
        productId: productVariantExited.product._id,
        variantId: productVariantExited._id
      })

      if (productVariantExited.productDiscount) {
        orderDetail.discount = productVariantExited.productDiscount.amount;
        orderDetail.isFixed = productVariantExited.productDiscount.isFixed;
        orderDetail.unitPrice = calculateDiscount(productVariantPrice, orderDetail.discount, orderDetail.isFixed);
      }
      orderDetail.totalPrice = orderDetail.unitPrice * productVariant.quantity;
      productVariantExited.quantity = productVariantExited.quantity - productVariant.quantity;

      await productVariantExited.save({ session })
      await orderDetail.save({ session });
      return orderDetail;
    }));

    const calcResult = orderDetails.reduce((acc, item) => {
      acc.totalQuantity += item.quantity;
      acc.totalPriceSum += item.totalPrice;
      return acc;
    }, { totalQuantity: 0, totalPriceSum: 0 });

    newOrder.quantity = calcResult.totalQuantity;
    const subTotal = calcResult.totalPriceSum;
    newOrder.subTotal = subTotal;
    newOrder.total = subTotal + newOrder.shippingFee;

    const newPayment = newPaymentService({
      orderId: newOrder._id,
      paymentMethod,
    });

    let paymentUrl;

    if (paymentMethod === PAYMENT_METHOD.MOMO) {
      const momoResponse = await createMomoPayment(newOrder._id, newOrder.total);
      if (!momoResponse.payUrl) {
        throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: "Create pay url failed" });
      }

      newPayment.transactionId = `${PAYMENT_METHOD.MOMO}_${newOrder._id}`;
      newPayment.notes = `Payment via ${PAYMENT_METHOD.MOMO}`;
      paymentUrl = momoResponse.payUrl;
    }

    if (paymentMethod === PAYMENT_METHOD.COD) {
      newPayment.transactionId = `${PAYMENT_METHOD.COD}_${newOrder._id}`;
      newPayment.notes = 'Cash on Delivery';
    }

    newOrder.paymentId = newPayment._id;
    if (paymentUrl) {
      newOrder.payUrl = paymentUrl;
    }

    const newOrderHistory = newOrderStatusHistoryService({
      status: ORDERS_STATUS.PENDING,
      orderId: newOrder._id,
      // assignedTo: Types.ObjectId,
    }, session);
    newOrder.orderStatusHistory = newOrderHistory._id;

    await newOrder.save({ session });
    await newPayment.save({ session });
    await newOrderHistory.save({ session })

    const orderDto = ModelDto.new(OrderDto, newOrder);
    return ApiResponse.success(orderDto);
  });
};

export const confirmOrderController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status !== ORDERS_STATUS.PENDING) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    if (!orderExisted.paymentId) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
    }

    const newOrderStatus = ORDERS_STATUS.CONFIRM;

    const newOrderHistory = await createOrderStatusHistoryService({
      status: newOrderStatus,
      orderId: orderExisted._id,
      // assignedTo: Types.ObjectId,
    }, session);

    const updatedOrder = await updateOrderStatusByIdService(orderExisted._id, newOrderStatus, newOrderHistory[0]._id, session);

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
};

export const processOrderController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status !== ORDERS_STATUS.CONFIRM) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    // if (!orderExisted.paymentId) {
    //   throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
    // }

    const newOrderStatus = ORDERS_STATUS.PROCESSING;

    const newOrderHistory = await createOrderStatusHistoryService({
      status: newOrderStatus,
      orderId: orderExisted._id,
      // assignedTo: Types.ObjectId,
    }, session);

    const updatedOrder = await updateOrderStatusByIdService(orderExisted._id, newOrderStatus, newOrderHistory[0]._id, session);


    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
};

export const createShippingOrderController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status !== ORDERS_STATUS.PROCESSING) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Invalid order status' });
    }

    if (!orderExisted.paymentId) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
    }

    const newOrderStatus = ORDERS_STATUS.WAITING_FOR_PICKUP;

    const orderDetails = await getOrderDetailsByOrderIdService(orderExisted._id);
    const newOrderGhn = await createGhnOrder(orderExisted, orderDetails);

    if (!newOrderGhn || newOrderGhn?.code != 200) {
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Create shipping order false' });
    }

    const newOrderHistory = await createOrderStatusHistoryService({
      status: newOrderStatus,
      shippingCarrier: "GHN",
      trackingNumber: newOrderGhn.data.order_code,
      expectedShipDate: newOrderGhn.data.expected_delivery_time,
      orderId: orderExisted._id,
      // assignedTo: Types.ObjectId,
    }, session);

    const updatedOrder = await updateOrderStatusByIdService(orderExisted._id, newOrderStatus, newOrderHistory[0]._id, session);

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
};

export const webHookUpdateOrder = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { CODAmount, Time, OrderCode, Status } = req.body;

    const orderStatusHistory = await getOrderStatusHistoryByTrackingIdService(OrderCode);

    const orderExisted = await getOrderByIdService(orderStatusHistory.orderId);
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

    const newOrderHistory = await createOrderStatusHistoryService({
      status: newOrderStatus,
      shippingCarrier: "GHN",
      trackingNumber: orderStatusHistory.trackingNumber,
      expectedShipDate: orderStatusHistory.expectedShipDate,
      orderId: orderExisted._id,
      // assignedTo: Types.ObjectId,
    }, session);

    if (newOrderStatus === ORDERS_STATUS.DELIVERED) {
      const payment = await getPaymentByIdService(orderExisted.paymentId);
      if (!payment) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment not found' });
      }
      if (payment.paymentMethod === PAYMENT_METHOD.COD && CODAmount || Time) {
        await updatePaymentByIdService(payment._id, {
          ...(CODAmount ? { amountPaid: CODAmount } : {}),
          ...(Time ? { paidDate: Time } : {})
        }, session)
      }
    }

    if (newOrderStatus === ORDERS_STATUS.CANCELLED) {
      await updateCancelOrderQuantityProductUtil(orderExisted._id, session);
    }

    const updatedOrder = await updateOrderStatusByIdService(orderExisted._id, newOrderStatus, newOrderHistory[0]._id, session);

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

export const cancelOrderController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId);
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

    const newOrderHistory = await createOrderStatusHistoryService({
      status: newOrderStatus,
      orderId: orderExisted._id,
      // assignedTo: Types.ObjectId,
    }, session);

    await updateCancelOrderQuantityProductUtil(orderExisted._id, session);

    if (orderExisted?.paymentId?.paidDate) {
      // refund
    }

    const updatedOrder = await updateOrderStatusByIdService(orderExisted._id, newOrderStatus, newOrderHistory[0]._id, session);

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

export const cancelOrderByCustomerController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { id } = req.user;
    const { orderId } = req.body;

    const orderExisted = await getOrderByIdService(orderId, { customerId: id });
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

    const newOrderHistory = await createOrderStatusHistoryService({
      status: newOrderStatus,
      orderId: orderExisted._id,
      // assignedTo: Types.ObjectId,
    }, session);

    await updateCancelOrderQuantityProductUtil(orderExisted._id, session);

    if (orderExisted?.paymentId?.paidDate) {
      // refund
    }

    const updatedOrder = await updateOrderStatusByIdService(orderExisted._id, newOrderStatus, newOrderHistory[0]._id, session);

    const orderDto = ModelDto.new(OrderDto, updatedOrder);
    return ApiResponse.success(orderDto);
  });
}

export const getAllOrdersController = async (req) => {
  const { customerId, paymentId, code, limit, page, sortBy, sortOrder } = req.query;

  const filters = {
    ...(customerId ? { customerId: customerId } : {}),
    ...(paymentId ? { paymentId: paymentId } : {}),
    ...(code ? { code: code } : {}),
  };

  const totalCount = await countAllOrdersService(filters);
  const orders = await getAllOrdersService({
    filters: filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success({ totalCount, list: ordersDto });
};

export const getAllOrdersByCustomerIdController = async (req) => {
  const { id } = req.user;
  const { code, limit, page, sortBy, sortOrder } = req.query;

  const filters = {
    customerId: id,
    ...(code ? { code: code } : {}),
  };

  const totalCount = await countAllOrdersService(filters);
  const orders = await getAllOrdersService({
    filters: filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success({ totalCount, list: ordersDto });
};

export const getOrderByIdController = async (req) => {
  const { orderId } = req.params;
  const order = await getOrderByIdService(orderId);
  if (!order) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }
  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
};

export const getOrderByCustomerIdController = async (req) => {
  const { id } = req.user;
  const { orderId } = req.params;
  const order = await getOrderByIdService(orderId, { customerId: id });
  if (!order) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }
  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto);
};

/////////////////
export const cancelExpiredOrders = async () => {
  const now = moment(); // Thời gian hiện tại
  const expirationThreshold = now.clone().subtract(24, 'hours'); // Thời điểm cách 24 giờ trước

  // Lọc các đơn hàng Pending quá 24 giờ
  const expiredOrders = await OrderModel.find({
    status: 'Pending',
    createdAt: { $lte: expirationThreshold.toDate() }, // createdAt <= 24h trước
  });

  if (expiredOrders.length === 0) {
    console.log('Không có đơn hàng nào quá hạn.');
    return;
  }

  // Cập nhật trạng thái thành Cancelled
  const orderIds = expiredOrders.map(order => order._id);
  await OrderModel.updateMany(
    { _id: { $in: orderIds } },
    { status: 'Cancelled', updatedAt: new Date() }
  );
  console.log(`Đã hủy ${expiredOrders.length} đơn hàng quá hạn.`);
};