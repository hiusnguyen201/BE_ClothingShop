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
  return await order.save({ session, ordered: true });
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
 * Add order status
 * @param {*} order
 * @param {*} newOrderStatus
 * @param {*} orderStatusHistoryId
 * @param {*} session
 * @returns
 */
export async function addOrderStatusHistoryByIdService(orderId, status, extraUpdateData = {}, session) {
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
export async function updateOrderByIdService(id, data, session) {
  return await OrderModel.updateOne({ _id: id }, data, { session });
}

/**
 * Remove order by id
 * @param {*} id
 * @returns
 */
export async function removeOrderByIdService(id, session) {
  return await OrderModel.deleteOne({ _id: id }, { session });
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

/**
 * Get Today Order Report Service
 * @param {*} data
 * @returns
 */
export async function getTodayOrderReportService() {
  const startOfToday = moment().startOf('day').toDate();
  const endOfToday = moment().endOf('day').toDate();

  const startOfYesterday = moment().subtract(1, 'day').startOf('day').toDate();
  const endOfYesterday = moment().subtract(1, 'day').endOf('day').toDate();

  const todayStats = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfToday,
          $lt: endOfToday,
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

  const yesterdayStats = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYesterday,
          $lt: endOfYesterday,
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

  const totalOrderOverall = await OrderModel.countDocuments();

  const totalNewPercentage =
    todayStats[0]?.totalNew && yesterdayStats[0]?.totalNew
      ? ((todayStats[0].totalNew - yesterdayStats[0].totalNew) / yesterdayStats[0].totalNew) * 100
      : 0;

  return {
    totalOrderOverall,
    todayTotalNewOrders: todayStats[0]?.totalNew || 0,
    yesterdayTotalNewOrders: yesterdayStats[0]?.totalNew || 0,
    percentage: totalNewPercentage.toFixed(1),
  };
}

/**
 * Get Revenue Report Service
 * @param {*} data
 * @returns
 */
export async function getTodayRevenueReportService() {
  const startOfToday = moment().startOf('day').toDate();
  const endOfToday = moment().endOf('day').toDate();

  const startOfYesterday = moment().subtract(1, 'day').startOf('day').toDate();
  const endOfYesterday = moment().subtract(1, 'day').endOf('day').toDate();

  const todayStats = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfToday,
          $lt: endOfToday,
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

  const yesterdayStats = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYesterday,
          $lt: endOfYesterday,
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

  const revenue = await OrderModel.aggregate([
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

  const totalRevenuePercentage =
    todayStats[0]?.totalNew && yesterdayStats[0]?.totalNew
      ? ((todayStats[0].totalNew - yesterdayStats[0].totalNew) / yesterdayStats[0].totalNew) * 100
      : 0;

  return {
    totalRevenueOverall: revenue[0]?.totalRevenue[0] || 0,
    todayTotalRevenue: todayStats[0]?.totalRevenue || 0,
    yesterdayTotalRevenue: yesterdayStats[0]?.totalRevenue || 0,
    percentage: totalRevenuePercentage.toFixed(1),
  };
}

/**
 * Get Today Sales Service
 * @param {*} data
 * @returns
 */
export async function getTodaySalesService() {
  const startOfToday = newDate().startOf('day').add(1, 'hour');
  const endOfToday = newDate().endOf('day').add(1, 'hour');

  const salesData = await OrderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfToday.toDate(),
          $lt: endOfToday.toDate(),
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
        _id: {
          $dateTrunc: {
            date: '$createdAt',
            unit: 'hour',
          },
        },
        sales: { $sum: '$total' },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        timestamp: '$_id',
        sales: 1,
        _id: 0,
      },
    },
  ]);

  const result = [];
  let currentTime = newDate(startOfToday);
  currentTime.startOf('hour');

  while (currentTime <= endOfToday) {
    const found = salesData.find((item) => {
      return newDate(item.timestamp).isSame(currentTime, 'hour');
    });

    result.push({
      timestamp: currentTime.toISOString(),
      sales: found ? found.sales : 0,
    });

    currentTime = newDate(currentTime).add(1, 'hour');
  }

  return result;
}
