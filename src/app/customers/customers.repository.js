import { isValidObjectId } from 'mongoose';
import { genSaltSync, hashSync } from 'bcrypt';
import { UserModel } from '#src/app/users/models/user.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { CUSTOMER_SELECTED_FIELDS } from '#src/app/customers/customers.constant';
import { REGEX_PATTERNS } from '#src/core/constant';
import { USER_TYPE } from '#src/app/users/users.constant';

/**
 * Count all customers
 * @returns {Promise<number>}
 */
export async function countAllCustomersRepository() {
  return UserModel.countDocuments({ type: USER_TYPE.CUSTOMER });
}

/**
 * New customer service
 * @param {*} data
 * @returns
 */
export function newCustomerRepository(data) {
  const salt = genSaltSync();
  const hashed = hashSync(data.password, salt);
  return new UserModel({
    ...data,
    password: hashed,
    type: USER_TYPE.CUSTOMER,
  });
}

/**
 * Create customer
 * @param {*} data
 * @returns
 */
export async function createCustomerRepository(data) {
  const salt = genSaltSync();
  const hashed = hashSync(data.password, salt);
  const customer = await UserModel.create({
    ...data,
    password: hashed,
    type: USER_TYPE.CUSTOMER,
  });
  return customer.toJSON();
}

/**
 * Insert customers service
 * @param {*} data
 * @returns
 */
export async function insertCustomersRepository(data = [], session) {
  return await UserModel.bulkSave(data, { session, ordered: true });
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
export async function getAndCountCustomersRepository(filters, skip, limit, sortBy, sortOrder) {
  const extraFilters = {
    ...filters,
    type: USER_TYPE.CUSTOMER,
  };

  const totalCount = await UserModel.countDocuments(extraFilters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await UserModel.find(extraFilters, CUSTOMER_SELECTED_FIELDS, queryOptions).lean();

  return [totalCount, list];
}
/**
 * Get customer by id
 * @param {string} id
 * @returns
 */
export async function getCustomerByIdRepository(id) {
  const filters = {
    type: USER_TYPE.CUSTOMER,
  };

  if (isValidObjectId(id)) {
    filters._id = id;
  } else {
    return null;
  }

  return UserModel.findOne(filters).select(CUSTOMER_SELECTED_FIELDS).lean();
}

/**
 * Get email by id
 * @param {*} id
 * @returns
 */
export async function getCustomerByEmailRepository(email, selectedFields = CUSTOMER_SELECTED_FIELDS) {
  const filters = {
    type: USER_TYPE.CUSTOMER,
  };

  if (email.match(REGEX_PATTERNS.EMAIL)) {
    filters.email = email;
  } else {
    return null;
  }

  return UserModel.findOne(filters).select(selectedFields).lean();
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 */
export async function updateCustomerInfoByIdRepository(id, data) {
  return UserModel.findByIdAndUpdate(id, data, {
    new: true,
  })
    .select(CUSTOMER_SELECTED_FIELDS)
    .lean();
}

/**
 * Remove customer by id
 * @param {*} id
 * @returns
 */
export async function removeCustomerByIdRepository(id) {
  return UserModel.findByIdAndSoftDelete(id).select(CUSTOMER_SELECTED_FIELDS).lean();
}

/**
 * Count new customer by date range
 * @param {Date} start
 * @param {Date} end
 * @returns {Promise<number>}
 */
export async function countNewCustomerByDateRangeRepository(start, end) {
  const result = await UserModel.aggregate([
    {
      $match: {
        type: USER_TYPE.CUSTOMER,
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
