import { HttpException } from '#src/core/exception/http-exception';
import {
  checkExistEmailService,
  createUserService,
  getUserByIdService,
  updateUserInfoByIdService,
  removeUserByIdService,
  getAndCountUsersService,
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

  const customersDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customersDto, 'Create customer successful');
};

export const getAllCustomersController = async (req) => {
  const adapter = await validateSchema(GetListCustomerDto, req.query);

  const searchFields = ['name', 'email', 'phone'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
    ...(adapter.gender ? { gender: adapter.gender } : {}),
    type: USER_TYPE.CUSTOMER,
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, customers] = await getAndCountUsersService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const customersDto = ModelDto.newList(CustomerDto, customers);

  return ApiResponse.success({ totalCount, list: customersDto }, 'Get all customers successful');
};

export const getCustomerByIdController = async (req) => {
  const adapter = await validateSchema(GetCustomerDto, req.params);

  const customer = await getUserByIdService(adapter.customerId, { type: USER_TYPE.CUSTOMER });
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(customerDto, 'Get customer successful');
};

export const updateCustomerByIdController = async (req) => {
  const adapter = await validateSchema(UpdateCustomerDto, { ...req.params, ...req.body });

  const existCustomer = await getUserByIdService(adapter.customerId, { type: USER_TYPE.CUSTOMER });
  if (!existCustomer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const isExistEmail = await checkExistEmailService(adapter.email, existCustomer._id);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const updatedCustomer = await updateUserInfoByIdService(existCustomer._id, adapter);

  const customerDto = ModelDto.new(CustomerDto, updatedCustomer);
  return ApiResponse.success(customerDto, 'Update customer successful');
};

export const removeCustomerByIdController = async (req) => {
  const adapter = await validateSchema(GetCustomerDto, req.params);

  const existCustomer = await getUserByIdService(adapter.customerId, { type: USER_TYPE.CUSTOMER });
  if (!existCustomer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  await removeUserByIdService(existCustomer._id);

  return ApiResponse.success({ id: existCustomer._id }, 'Remove customer successful');
};
