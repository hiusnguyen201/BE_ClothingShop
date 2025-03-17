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
  saveUserService,
} from '#src/app/v1/users/users.service';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { randomStr } from '#src/utils/string.util';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import { calculatePagination } from '#src/utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { CustomerDto } from '#src/app/v1/customers/dtos/customer.dto';
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

  await saveUserService(customer);
  sendPasswordService(email, password);

  const customersDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customersDto, 'Create customer successfully');
};

export const getAllCustomersController = async (req) => {
  let { keyword = '', limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }],
    type: USER_TYPE.CUSTOMER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const customers = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const customersDto = ModelDto.newList(CustomerDto, customers);
  return ApiResponse.success({ meta: metaData, list: customersDto }, 'Get all customers successfully');
};

export const getCustomerByIdController = async (req) => {
  const { id } = req.params;
  const customer = await getUserByIdService(id);
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customerDto, 'Get customer successfully');
};

export const updateCustomerByIdController = async (req) => {
  const { id } = req.params;
  const { email } = req.body;
  const existCustomer = await getUserByIdService(id);
  if (!existCustomer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
    }
  }

  const updatedCustomer = await updateUserInfoByIdService(id, req.body);

  const customerDto = ModelDto.new(CustomerDto, updatedCustomer);
  return ApiResponse.success(customerDto, 'Update customer successfully');
};

export const removeCustomerByIdController = async (req) => {
  const { id } = req.params;
  const existCustomer = await getUserByIdService(id);
  if (!existCustomer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const removedCustomer = await removeUserByIdService(id);

  const customerDto = ModelDto.new(CustomerDto, removedCustomer);
  return ApiResponse.success(customerDto, 'Remove customer successfully');
};
