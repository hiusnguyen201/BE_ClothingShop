import { OrderModel } from '#src/app/orders/models/orders.model';
import { isValidObjectId } from 'mongoose';
import { ORDER_SELECTED_FIELDS } from '#src/app/orders/orders.constant';
import { USER_SELECTED_FIELDS } from '#src/app/users/users.constant';
import { ORDER_STATUS_HISTORY_MODEL } from '#src/app/order-status-history/models/order-status-history.model';
import { USER_MODEL } from '#src/app/users/models/user.model';
import { PAYMENT_MODEL } from '#src/app/payments/models/payments.model';
import { PAYMENT_SELECTED_FIELDS } from '#src/app/payments/payments.constant';
import { ORDER_DETAIL_MODEL } from '#src/app/order-details/models/order-details.model';
import { PRODUCT_SELECT_FIELDS } from '#src/app/products/products.constant';

/**
 * New order
 * @param {*} data
 * @returns
 */
export function newOrderService(data) {
  return new OrderModel(data);
}

/**
 * Save order
 * @param {*} data
 * @returns
 */
export async function saveOrderService(order, session) {
  return await order.save({ session });
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
export async function getOrderByIdService(id, selectedFields = ORDER_SELECTED_FIELDS) {
  if (!id) return null;
  const filters = {};

  if (isValidObjectId(id)) {
    filters._id = id;
  } else {
    filters.code = id;
  }

  return OrderModel.findOne(filters)
    .populate({ path: 'payment', select: PAYMENT_SELECTED_FIELDS })
    .populate({ path: 'orderStatusHistory' })
    .populate({
      path: 'orderDetails',
      populate: [
        {
          path: 'variant',
          populate: {
            path: 'variantValues',
            populate: [
              { path: 'option', options: { lean: true }, select: '_id name' },
              { path: 'optionValue', options: { lean: true }, select: '_id valueName' },
            ],
          },
        },
        ,
        { path: 'product', select: PRODUCT_SELECT_FIELDS },
      ],
    })
    .populate({ path: 'customer', select: USER_SELECTED_FIELDS })
    .select(selectedFields)
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
 * Get and count orders
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountOrdersService(filters, skip, limit, sortBy, sortOrder) {
  const totalCountResult = await OrderModel.aggregate([
    {
      $lookup: {
        from: ORDER_STATUS_HISTORY_MODEL,
        localField: 'orderStatusHistory',
        foreignField: '_id',
        as: 'orderStatusHistory',
      },
    },
    {
      $addFields: {
        lastStatus: { $arrayElemAt: ['$orderStatusHistory', -1] },
      },
    },
    ...(filters.status
      ? [
          {
            $match: {
              'lastStatus.status': filters.status,
            },
          },
        ]
      : []),
    {
      $count: 'totalCount',
    },
  ]);

  const orders = await OrderModel.aggregate([
    {
      $lookup: {
        from: ORDER_STATUS_HISTORY_MODEL,
        localField: 'orderStatusHistory',
        foreignField: '_id',
        as: 'orderStatusHistory',
      },
    },
    {
      $lookup: {
        from: ORDER_DETAIL_MODEL,
        localField: 'orderDetails',
        foreignField: '_id',
        as: 'orderDetails',
      },
    },
    {
      $lookup: {
        from: USER_MODEL,
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
        pipeline: [{ $project: USER_SELECTED_FIELDS }],
      },
    },
    {
      $lookup: {
        from: PAYMENT_MODEL,
        localField: 'payment',
        foreignField: '_id',
        as: 'payment',
        pipeline: [{ $project: PAYMENT_SELECTED_FIELDS }],
      },
    },
    {
      $addFields: {
        lastStatus: { $arrayElemAt: ['$orderStatusHistory', -1] },
      },
    },
    ...(filters.status
      ? [
          {
            $match: {
              'lastStatus.status': filters.status,
            },
          },
        ]
      : []),
    {
      $unwind: {
        path: '$customer',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$payment',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: ORDER_SELECTED_FIELDS,
    },
  ])
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  return [totalCountResult[0]?.totalCount || 0, orders];
}

/**
 * Update order status
 * @param {*} order
 * @param {*} newOrderStatus
 * @param {*} orderStatusHistoryId
 * @param {*} session
 * @returns
 */
export async function updateOrderStatusByIdService(order, newOrderStatus, orderStatusHistoryId, session) {
  return OrderModel.findByIdAndUpdate(
    order,
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

/**
 * Update order
 * @param {*} order
 * @param {*} data
 * @param {*} session
 * @returns
 */
export async function updateOrderByIdService(id, data, session) {
  return await OrderModel.updateOne({ _id: id }, data, { session });
}

/**
 * Remove order by id
 * @param {*} id
 * @returns
 */
export async function removeOrderByIdService(id) {
  return OrderModel.findByIdAndDelete(id).select(ORDER_SELECTED_FIELDS).lean();
}

/**
 * Calculate order
 * @param {*} data
 * @returns
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
