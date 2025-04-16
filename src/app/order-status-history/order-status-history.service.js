import { OrderStatusHistoryModel } from '#src/app/order-status-history/models/order-status-history.model';

/**
 * New order status history
 * @param {*} data
 * @returns
 */
export function newOrderStatusHistoryService(data) {
  return new OrderStatusHistoryModel(data);
}

/**
 * Create order status history
 * @param {*} data
 * @returns
 */
export async function createOrderStatusHistoryService(data, session) {
  return await OrderStatusHistoryModel.create([data], { session });
}

/**
 * Duplicate check order status history
 * @param {*} data
 * @returns
 */
export async function duplicateCheckOrderStatusHistoryService(order, orderStatus) {
  if (!order) return null;

  return await OrderStatusHistoryModel.findOne({
    order,
    status: orderStatus
  });
}

/**
 * Find one order status history by tracking id
 * @param {*} id
 * @returns
 */
export async function getOrderStatusHistoryByTrackingIdService(trackingId) {
  if (!trackingId) return null;
  return await OrderStatusHistoryModel.findOne({
    trackingNumber: trackingId,
  });
}