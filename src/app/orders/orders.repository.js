import { OrderModel } from '#src/app/orders/models/orders.model';
import { isValidObjectId } from 'mongoose';
import { ORDER_SELECTED_FIELDS, ORDER_STATUS } from '#src/app/orders/orders.constant';
import { USER_SELECTED_FIELDS } from '#src/app/users/users.constant';
import { USER_MODEL } from '#src/app/users/models/user.model';
import { PAYMENT_MODEL } from '#src/app/payments/models/payments.model';
import { PAYMENT_SELECTED_FIELDS } from '#src/app/payments/payments.constant';
import { ORDER_DETAIL_MODEL } from '#src/app/order-details/models/order-details.model';
import { PRODUCT_SELECT_FIELDS } from '#src/app/products/products.constant';
import moment from 'moment-timezone';
import { newDate } from '#src/utils/string.util';
import { ORDER_DETAILS_SELECTED_FIELDS } from '#src/app/order-details/order-details.constant';

/**
 * New order
 * @param {*} data
 * @returns
 */
export function newOrderRepository(data) {
  return new OrderModel(data);
}

/**
 * Insert list order
 * @param {object} data
 * @returns
 */
export async function insertOrdersRepository(data, session) {
  return await OrderModel.bulkSave(data, { session, ordered: true });
}

/**
 * Save order
 * @param {*} data
 * @returns
 */
export async function saveOrderRepository(order, session) {
  return await order.save({ session, ordered: true });
}

/**
 * Create order
 * @param {*} data
 * @returns
 */
export async function createOrdersRepository(data, session) {
  return OrderModel.create(data, { session });
}

/**
 * Find one order by id
 * @param {*} id
 * @returns
 */
export async function getOrderByIdRepository(id, selectedFields = ORDER_SELECTED_FIELDS) {
  if (!id) return null;
  const filters = {};

  if (isValidObjectId(id)) {
    filters._id = id;
  } else {
    filters.code = +id;
  }

  const order = await OrderModel.findOne(filters)
    .populate({ path: 'payment', select: PAYMENT_SELECTED_FIELDS })
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

  if (order) {
    order.orderStatusHistory.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return order;
  } else {
    return null;
  }
}

/**
 * Count all orders
 * @param {*} filters
 * @returns
 */
export async function countAllOrdersRepository(filters) {
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
export async function getAndCountOrdersRepository(filters, skip, limit, sortBy, sortOrder) {
  const statusStage = filters.status;
  delete filters.status;

  const totalCountResult = await OrderModel.aggregate([
    {
      $match: filters,
    },
    {
      $addFields: {
        lastStatus: { $arrayElemAt: ['$orderStatusHistory', -1] },
      },
    },
    ...(statusStage
      ? [
          {
            $match: {
              'lastStatus.status': statusStage,
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
      $match: filters,
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
    ...(statusStage
      ? [
          {
            $match: {
              'lastStatus.status': statusStage,
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
 * Add order status
 * @param {*} order
 * @param {*} newOrderStatus
 * @param {*} orderStatusHistoryId
 * @param {*} session
 * @returns
 */
export async function addOrderStatusHistoryByIdRepository(orderId, status, extraUpdateData = {}, session) {
  return OrderModel.updateOne(
    { _id: orderId },
    {
      ...extraUpdateData,
      $push: { orderStatusHistory: { status, updatedAt: new Date() } },
    },
    {
      session,
      ordered: true,
    },
  );
}

/**
 * Update order
 * @param {*} order
 * @param {*} data
 * @param {*} session
 * @returns
 */
export async function updateOrderByIdRepository(id, data, session) {
  return await OrderModel.updateOne({ _id: id }, data, { session });
}

/**
 * Remove order by id
 * @param {*} id
 * @returns
 */
export async function removeOrderByIdRepository(id, session) {
  return await OrderModel.findByIdAndSoftDelete(id, { session }).select('_id');
}

/**
 * Count new order by date range
 * @param {Date} start
 * @param {Date} end
 * @returns {Promise<number>}
 */
export async function countNewOrderByDateRangeRepository(start, end) {
  const result = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalNew: { $sum: 1 },
      },
    },
  ]);

  return result[0]?.totalNew || 0;
}

export async function calculateTotalRevenueRepository() {
  const result = await OrderModel.aggregate([
    {
      $project: {
        total: 1,
        lastStatus: {
          $arrayElemAt: ['$orderStatusHistory.status', -1],
        },
      },
    },
    { $match: { lastStatus: ORDER_STATUS.COMPLETED } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
      },
    },
  ]);

  return result[0]?.totalRevenue || 0;
}

/**
 * Calculate total Revenue By Date Range
 * @param {Date} start
 * @param {Date} end
 * @returns {Promise<number>}
 */
export async function calculateTotalRevenueByDateRangeRepository(start, end) {
  const result = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $project: {
        total: 1,
        lastStatus: {
          $arrayElemAt: ['$orderStatusHistory.status', -1],
        },
      },
    },
    { $match: { lastStatus: ORDER_STATUS.COMPLETED } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
      },
    },
  ]);

  return result[0]?.totalRevenue || 0;
}

/**
 * Get Sales by date range Repository
 * @param {Date} start
 * @param {Date} end
 * @param {string} unit
 * @returns
 */
export async function getSalesByDateRangeRepository(start, end, unit) {
  const orders = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $project: {
        createdAt: 1,
        lastStatus: {
          $arrayElemAt: ['$orderStatusHistory.status', -1],
        },
      },
    },
    {
      $match: {
        lastStatus: ORDER_STATUS.COMPLETED,
      },
    },
    {
      $sort: { createdAt: 1 },
    },
  ]);

  const buckets = [];
  let current = moment(start).startOf(unit);
  const endMoment = moment(end);

  while (current.isBefore(endMoment)) {
    const startDate = current.clone().startOf(unit);
    const endDate = current.clone().endOf(unit);

    const sales = orders.filter((order) => moment(order.createdAt).isBetween(startDate, endDate, null, '[]')).length;

    buckets.push({
      sales,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
    });

    current.add(1, unit);
  }

  return buckets;
}
