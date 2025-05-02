import moment from 'moment-timezone';
import { UserModel } from '#src/app/users/models/user.model';
import { USER_SELECTED_FIELDS, USER_TYPE } from '#src/app/users/users.constant';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { isValidObjectId } from 'mongoose';

export async function getTodayCustomerReportService() {
  const startOfToday = moment().startOf('day').toDate();
  const endOfToday = moment().endOf('day').toDate();

  const startOfYesterday = moment().subtract(1, 'day').startOf('day').toDate();
  const endOfYesterday = moment().subtract(1, 'day').endOf('day').toDate();

  const todayStats = await UserModel.aggregate([
    {
      $match: {
        type: USER_TYPE.CUSTOMER,
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

  const yesterdayStats = await UserModel.aggregate([
    {
      $match: {
        type: USER_TYPE.CUSTOMER,
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

  const totalCustomerOverall = await UserModel.countDocuments({
    type: USER_TYPE.CUSTOMER,
  });

  const totalNewPercentage =
    todayStats[0]?.totalNew && yesterdayStats[0]?.totalNew
      ? ((todayStats[0].totalNew - yesterdayStats[0].totalNew) / yesterdayStats[0].totalNew) * 100
      : 0;

  return {
    totalCustomerOverall,
    todayTotalNewCustomers: todayStats[0]?.totalNew || 0,
    yesterdayTotalNewCustomers: yesterdayStats[0]?.totalNew || 0,
    percentage: totalNewPercentage.toFixed(1),
  };
}

/**
 * Get customer by id
 * @param {string} id
 * @returns
 */
export async function getCustomerByIdService(id) {
  const filters = {
    type: USER_TYPE.CUSTOMER,
  };

  if (isValidObjectId(id)) {
    filters._id = id;
  } else {
    return null;
  }

  return UserModel.findOne(filters).select(USER_SELECTED_FIELDS).lean();
}

/**
 * Get and count customers
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountCustomersService(filters, skip, limit, sortBy, sortOrder) {
  const extraFilters = {
    ...filters,
    type: USER_TYPE.CUSTOMER,
  };

  const totalCount = await UserModel.countDocuments(extraFilters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await UserModel.find(extraFilters, USER_SELECTED_FIELDS, queryOptions).lean();

  return [totalCount, list];
}
