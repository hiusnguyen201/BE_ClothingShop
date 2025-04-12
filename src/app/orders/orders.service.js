import { OrderModel } from '#src/app/orders/models/orders.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { isValidObjectId } from 'mongoose';
import { ORDER_SELECTED_FIELDS } from '#src/app/orders/orders.constant';

/**
 * New order
 * @param {*} data
 * @returns
 */
export function newOrderService(data) {
  return new OrderModel(data);
}

/**
 * Create order
 * @param {*} data
 * @returns
 */
export async function createOrdersService(data, session) {
  return await OrderModel.create(data, { session });
}

/**
 * Find one order by id
 * @param {*} id
 * @returns
 */
export async function getOrderByIdService(id, extras = {}) {
  if (!id) return null;
  const filters = {
    ...extras,
  };

  if (isValidObjectId(id)) {
    filters._id = id;
  } else {
    return null;
  }

  return await OrderModel.findOne(filters)
    .select(ORDER_SELECTED_FIELDS)
    .populate('paymentId')
    .lean();
}

/**
 * Count all orders
 * @param {*} filters
 * @returns
 */
export async function countAllOrdersService(filters) {
  return OrderModel.countDocuments(filters);
}

/**
 * Get all orders
 * @param {*} query
 * @returns
 */
export async function getAllOrdersService(payload) {
  const { filters = {}, page, limit, sortBy, sortOrder } = payload;

  let queryOptions = {};
  queryOptions = extendQueryOptionsWithPagination({ page, limit }, queryOptions);
  queryOptions = extendQueryOptionsWithSort({ sortBy, sortOrder }, queryOptions);

  return OrderModel.find(filters, ORDER_SELECTED_FIELDS, queryOptions).lean();
}

/**
 * Update order status
 * @param {*} query
 * @returns
 */
export async function updateOrderStatusByIdService(orderId, newOrderStatus, orderStatusHistoryId, session) {
  return await OrderModel.findByIdAndUpdate(orderId, {
    status: newOrderStatus,
    $push: { orderStatusHistory: orderStatusHistoryId }
  }, {
    new: true,
    session
  }).select(ORDER_SELECTED_FIELDS)
    .lean();
}