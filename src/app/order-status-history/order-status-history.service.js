import { OrderStatusHistoryModel } from '#src/app/order-status-history/models/order-status-history.model';
import { ORDERS_STATUS } from '#src/core/constant';
import { isValidObjectId } from 'mongoose';

/**
 * New order status history
 * @param {*} data
 * @returns
 */
export function newOrderStatusHistoryService(data) {
  return new OrderStatusHistoryModel(data);
}

export async function createOrderStatusHistoryService(data, session) {
  return await OrderStatusHistoryModel.create([data], { session });
}

export async function duplicateCheckOrderStatusHistoryService(orderId, orderStatus) {
  if (!orderId) return null;

  return await OrderStatusHistoryModel.findOne({
    orderId,
    status: orderStatus
  });
}


/**
 * Find one order status history by id
 * @param {*} id
 * @returns
 */
export async function getOrderIdByTrackingIdService(trackingId) {
  if (!trackingId) return null;
  return await OrderStatusHistoryModel.findOne({
    trackingNumber: trackingId,
  });
}





export async function getAllOrdersByUserService({ filters, offset = 0, limit = 10, sortOptions }) {
  return await OrderStatusHistoryModel.find(filters).skip(offset).limit(limit).sort(sortOptions).lean();
}

/**
 * Find one order status history by id
 * @param {*} id
 * @returns
 */
export async function getOrderStatusHistoryByIdService(orderId) {
  if (!orderId) return null;
  const filter = {};

  if (isValidObjectId(orderId)) {
    filter._id = orderId;
  } else {
    return null;
  }

  return await OrderStatusHistoryModel.findOne({
    _id: orderId,
  }).populate('paymentId');
}

export async function updateOrderStatusHistoryByIdService(orderId, data, session) {
  return await OrderStatusHistoryModel.findByIdAndUpdate(orderId, data, {
    new: true,
    session
  });
}

export async function updateOrderStatusToConfirmByIdService(orderId, session) {
  return await OrderStatusHistoryModel.findByIdAndUpdate(orderId, {
    status: ORDERS_STATUS.CONFIRM,
  }, {
    new: true,
    session
  });
}

export async function updateOrderStatusToProcressByIdService(orderId, session) {
  return await OrderStatusHistoryModel.findByIdAndUpdate(orderId, {
    status: ORDERS_STATUS.PROCESSING,
  }, {
    new: true,
    session
  });
}

export async function cancelOrderByIdService(orderId, session) {
  return await OrderStatusHistoryModel.findByIdAndUpdate(orderId, {
    status: ORDERS_STATUS.CANCELLED,
  }, {
    new: true,
    session
  });
}

export async function removeOrderByIdService(orderId) {
  return await OrderStatusHistoryModel.findByIdAndDelete(orderId);
}

export async function countAllOrdersService(filters) {
  return OrderStatusHistoryModel.countDocuments(filters);
}
