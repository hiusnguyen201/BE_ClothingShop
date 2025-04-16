import { OrderModel } from '#src/app/orders/models/orders.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { isValidObjectId } from 'mongoose';
import { ORDER_SELECTED_FIELDS } from '#src/app/orders/orders.constant';
import { USER_SELECTED_FIELDS } from '#src/app/users/users.constant';

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
  return OrderModel.create(data, { session });
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

  return OrderModel.findOne(filters).select(ORDER_SELECTED_FIELDS).populate('paymentId').lean();
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
 * Get and count orders
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountOrdersService(filters, skip, limit, sortBy, sortOrder) {
  const totalCount = await OrderModel.countDocuments(filters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await OrderModel.find(filters, ORDER_SELECTED_FIELDS, queryOptions)
    .populate({ path: 'customer', select: USER_SELECTED_FIELDS })
    .populate({ path: 'orderStatusHistory' })
    .lean();

  return [totalCount, list];
}

/**
 * Update order status
 * @param {*} orderId
 * @param {*} newOrderStatus
 * @param {*} orderStatusHistoryId
 * @param {*} session
 * @returns
 */
export async function updateOrderStatusByIdService(orderId, newOrderStatus, orderStatusHistoryId, session) {
  return OrderModel.findByIdAndUpdate(
    orderId,
    {
      status: newOrderStatus,
      $push: { orderStatusHistory: orderStatusHistoryId },
    },
    {
      new: true,
      session,
    },
  )
    .select(ORDER_SELECTED_FIELDS)
    .lean();
}
