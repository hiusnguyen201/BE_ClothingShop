'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import {
  checkExistEmailService,
  createUserService,
  getUserByIdService,
  getAllUsersService,
  updateUserInfoByIdService,
  removeUserByIdService,
  countAllUsersService,
} from '#src/app/users/users.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { randomStr } from '#src/utils/string.util';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { CustomerDto } from '#src/app/customers/dtos/customer.dto';
import { Code } from '#src/core/code/Code';

export const createCustomerController = async (req) => {
  const { email } = req.body;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const password = randomStr(32);
  const customer = await createUserService({
    ...req.body,
    password,
    type: USER_TYPE.CUSTOMER,
  });

  sendPasswordService(email, password);

  const customersDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customersDto, 'Create customer successful');
};

export const getAllCustomersController = async (req) => {
  const { keyword, limit, page, sortBy, sortOrder, gender } = req.query;

  const filters = {
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
      { phone: { $regex: keyword, $options: 'i' } },
    ],
    ...(gender ? { gender } : {}),
    type: USER_TYPE.CUSTOMER,
  };

  const totalCount = await countAllUsersService(filters);

  const customers = await getAllUsersService({
    filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const customersDto = ModelDto.newList(CustomerDto, customers);
  return ApiResponse.success({ totalCount, list: customersDto }, 'Get all customers successful');
};

export const getCustomerByIdController = async (req) => {
  const { customerId } = req.params;

  const customer = await getUserByIdService(customerId, { type: USER_TYPE.CUSTOMER });
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customerDto, 'Get customer successful');
};

export const updateCustomerByIdController = async (req) => {
  const { customerId } = req.params;
  const { email } = req.body;

  const existCustomer = await getUserByIdService(customerId, { type: USER_TYPE.CUSTOMER });
  if (!existCustomer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  if (email) {
    const isExistEmail = await checkExistEmailService(email, customerId);
    if (isExistEmail) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
    }
  }

  const updatedCustomer = await updateUserInfoByIdService(customerId, req.body);

  const customerDto = ModelDto.new(CustomerDto, updatedCustomer);
  return ApiResponse.success(customerDto, 'Update customer successful');
};

export const removeCustomerByIdController = async (req) => {
  const { customerId } = req.params;

  const existCustomer = await getUserByIdService(customerId, { type: USER_TYPE.CUSTOMER });
  if (!existCustomer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  await removeUserByIdService(customerId);

  return ApiResponse.success({ id: existCustomer._id }, 'Remove customer successful');
};
