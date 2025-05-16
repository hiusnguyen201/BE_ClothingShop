import {
  countAllCustomersRepository,
  countNewCustomerByDateRangeRepository,
  createCustomerRepository,
  getAndCountCustomersRepository,
  getCustomerByIdRepository,
  removeCustomerByIdRepository,
  updateCustomerInfoByIdRepository,
} from '#src/app/customers/customers.repository';
import { Assert } from '#src/core/assert/Assert';
import { HttpException } from '#src/core/exception/http-exception';
import { getDateComparisonRange } from '#src/app/report/report.util';
import { checkExistEmailRepository } from '#src/app/users/users.repository';
import { randomStr } from '#src/utils/string.util';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import {
  deleteCustomerFromCache,
  getCustomersFromCache,
  setCustomersToCache,
  getCustomerFromCache,
  setCustomerToCache,
} from '#src/app/customers/customers.cache';
import { CUSTOMER_SEARCH_FIELDS } from '#src/app/customers/customers.constant';
import { Code } from '#src/core/code/Code';
import { notifyClientsOfNewCustomer } from '#src/app/notifications/notifications.service';

/**
 * @typedef {import ("#src/app/report/dtos/get-customer-report.dto").GetCustomerReportDto} GetCustomerReportPort
 * @typedef {import ("#src/app/customers/dtos/create-customer.dto").CreateCustomerDto} CreateCustomerPort
 * @typedef {import ("#src/app/customers/dtos/get-list-customer.dto").GetListCustomerDto} GetListCustomerPort
 * @typedef {import ("#src/app/customers/dtos/get-customer.dto").GetCustomerDto} GetCustomerPort
 * @typedef {import ("#src/app/customers/dtos/update-customer.dto").UpdateCustomerDto} UpdateCustomerPort
 */

/**
 * Create customer
 * @param {CreateCustomerPort} payload
 * @returns {Promise<UserModel>}
 */
export const createCustomerService = async (payload) => {
  const isExistEmail = await checkExistEmailRepository(payload.email);
  Assert.isFalse(
    isExistEmail,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' }),
  );

  const password = randomStr(32);
  const customer = await createCustomerRepository({
    ...payload,
    password,
  });

  sendPasswordService(payload.email, password);

  // Clear cache
  await deleteCustomerFromCache(customer._id);

  // Notify to client
  await notifyClientsOfNewCustomer({
    customerId: customer._id,
    name: customer.name,
    email: customer.email,
  });

  return customer;
};

/**
 * Get all customers
 * @param {GetListCustomerPort} payload
 * @returns
 */
export const getAllCustomersService = async (payload) => {
  const filters = {
    $or: CUSTOMER_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
    ...(payload.gender && { gender: payload.gender }),
    ...(payload.status && {
      verifiedAt: {
        ...(payload.status === 'active' ? { $ne: null } : { $eq: null }),
      },
    }),
  };

  const cached = await getCustomersFromCache(payload);
  if (cached && Array.isArray(cached) && cached.length === 2 && cached[0] > 0) {
    return cached;
  }

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, customers] = await getAndCountCustomersRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  await setCustomersToCache(payload, totalCount, customers);

  return [totalCount, customers];
};

/**
 * Get customer
 * @param {GetCustomerPort} payload
 * @returns {Promise<UserModel>}
 */
export const getCustomerByIdOrFailService = async (payload) => {
  const cached = await getCustomerFromCache(payload.customerId);
  if (cached) return cached;

  const customer = await getCustomerByIdRepository(payload.customerId);
  Assert.isTrue(customer, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' }));

  await setCustomerToCache(payload.customerId, customer);

  return customer;
};

/**
 * Update customer by id
 * @param {UpdateCustomerPort} payload
 * @returns {Promise<UserModel>}
 */
export const updateCustomerByIdOrFailService = async (payload) => {
  const customer = await getCustomerByIdRepository(payload.customerId);
  Assert.isTrue(customer, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' }));

  const isExistEmail = await checkExistEmailRepository(payload.email, customer._id);
  Assert.isFalse(
    isExistEmail,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' }),
  );

  const updatedCustomer = await updateCustomerInfoByIdRepository(customer._id, { ...payload, role: payload.roleId });

  // Clear cache
  await deleteCustomerFromCache(customer._id);

  return updatedCustomer;
};

/**
 * Remove customer
 * @param {GetCustomerPort} payload
 * @returns {Promise<{id: string}>}
 */
export const removeCustomerByIdOrFailService = async (payload) => {
  const customer = await getCustomerByIdRepository(payload.customerId);
  Assert.isTrue(customer, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' }));

  await removeCustomerByIdRepository(customer._id);

  // Clear cache
  await deleteCustomerFromCache(customer._id);

  return { id: customer._id };
};

/**
 * Get customer report by date range
 * @param {GetCustomerReportDto} payload
 * @returns
 */
export async function getCustomerReportByDateRangeService(payload) {
  const { current, previous } = getDateComparisonRange(payload.compareTo);

  const currentCountNewCustomer = await countNewCustomerByDateRangeRepository(current.start, current.end);
  const previousCountNewCustomer = await countNewCustomerByDateRangeRepository(previous.start, previous.end);
  const totalCustomerOverall = await countAllCustomersRepository();

  const percentage =
    currentCountNewCustomer && previousCountNewCustomer
      ? ((currentCountNewCustomer - previousCountNewCustomer) / previousCountNewCustomer) * 100
      : 0;

  return {
    totalCustomerOverall,
    currentCountNewCustomer,
    previousCountNewCustomer,
    percentage: percentage.toFixed(1),
  };
}
