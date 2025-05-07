import { HttpException } from '#src/core/exception/http-exception';
import {
  checkExistEmailService,
  createUserService,
  updateUserInfoByIdService,
  removeUserByIdService,
} from '#src/app/users/users.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { randomStr } from '#src/utils/string.util';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { CustomerDto } from '#src/app/customers/dtos/customer.dto';
import { Code } from '#src/core/code/Code';
import { GetListCustomerDto } from '#src/app/customers/dtos/get-list-customer.dto';
import { GetCustomerDto } from '#src/app/customers/dtos/get-customer.dto';
import { CreateCustomerDto } from '#src/app/customers/dtos/create-customer.dto';
import { UpdateCustomerDto } from '#src/app/customers/dtos/update-customer.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { notifyClientsOfNewCustomer } from '#src/app/notifications/notifications.service';
import { getAndCountCustomersService, getCustomerByIdService } from '#src/app/customers/customers.service';
import {
  deleteCustomerFromCache,
  getCustomerFromCache,
  getTotalCountAndListCustomerFromCache,
  setCustomerToCache,
  setTotalCountAndListCustomerToCache,
} from '#src/app/customers/customers-cache.service';
import { CUSTOMER_SEARCH_FIELDS } from '#src/app/customers/customers.constant';

export const createCustomerController = async (req) => {
  const adapter = await validateSchema(CreateCustomerDto, req.body);

  const isExistEmail = await checkExistEmailService(adapter.email);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const password = randomStr(32);
  const customer = await createUserService({
    ...adapter,
    password,
    type: USER_TYPE.CUSTOMER,
  });

  sendPasswordService(adapter.email, password);

  // Clear cache
  await deleteCustomerFromCache(customer._id);

  const customerDto = ModelDto.new(CustomerDto, customer);

  // Notify to client
  await notifyClientsOfNewCustomer({
    customerId: customerDto.id,
    name: customerDto.name,
    email: customerDto.email,
  });

  return ApiResponse.success(customerDto, 'Create customer successful');
};

export const getAllCustomersController = async (req) => {
  const adapter = await validateSchema(GetListCustomerDto, req.query);

  const filters = {
    $or: CUSTOMER_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
    ...(adapter.gender ? { gender: adapter.gender } : {}),
  };

  let [totalCountCached, customersCached] = await getTotalCountAndListCustomerFromCache({ ...adapter, ...filters });

  if (customersCached.length === 0) {
    const skip = (adapter.page - 1) * adapter.limit;
    const [totalCount, customers] = await getAndCountCustomersService(
      filters,
      skip,
      adapter.limit,
      adapter.sortBy,
      adapter.sortOrder,
    );

    await setTotalCountAndListCustomerToCache(adapter, totalCount, customers);

    totalCountCached = totalCount;
    customersCached = customers;
  }

  const customersDto = ModelDto.newList(CustomerDto, customersCached);
  return ApiResponse.success({ totalCount: totalCountCached, list: customersDto }, 'Get all customers successful');
};

export const getCustomerByIdController = async (req) => {
  const adapter = await validateSchema(GetCustomerDto, req.params);

  let customer = await getCustomerFromCache(adapter.customerId);
  if (!customer) {
    customer = await getCustomerByIdService(adapter.customerId);
    await setCustomerToCache(adapter.customerId, customer);
  }

  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customerDto, 'Get customer successful');
};

export const updateCustomerByIdController = async (req) => {
  const adapter = await validateSchema(UpdateCustomerDto, { ...req.params, ...req.body });

  const customer = await getCustomerByIdService(adapter.customerId);
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const isExistEmail = await checkExistEmailService(adapter.email, customer._id);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const updatedCustomer = await updateUserInfoByIdService(customer._id, adapter);

  // Clear cache
  await deleteCustomerFromCache(customer._id);

  const customerDto = ModelDto.new(CustomerDto, updatedCustomer);
  return ApiResponse.success(customerDto, 'Update customer successful');
};

export const removeCustomerByIdController = async (req) => {
  const adapter = await validateSchema(GetCustomerDto, req.params);

  const existCustomer = await getCustomerByIdService(adapter.customerId);
  if (!existCustomer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  await removeUserByIdService(existCustomer._id);

  // Clear cache
  await deleteCustomerFromCache(customer._id);

  return ApiResponse.success({ id: existCustomer._id }, 'Remove customer successful');
};
