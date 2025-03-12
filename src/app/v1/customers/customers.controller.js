import HttpStatus from 'http-status-codes';
import { NotFoundException, ConflictException } from '#core/exception/http-exception';
import {
  updateUserAvatarByIdService,
  checkExistEmailService,
  createUserService,
  getUserByIdService,
  getAllUsersService,
  updateUserInfoByIdService,
  removeUserByIdService,
  countAllUsersService,
  saveUserService,
} from '#src/app/v1/users/users.service';
import { UserConstant } from '#app/v2/users/UserConstant';
import { randomStr } from '#utils/string.util';
import { sendPasswordService } from '#modules/mailer/mailer.service';
import { calculatePagination } from '#utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { Dto } from '#src/core/dto/Dto';
import { CustomerDto } from '#src/app/v1/customers/dtos/customer.dto';
import { uploadImageBufferService } from '#src/modules/cloudinary/CloudinaryService';

export const createCustomerController = async (req) => {
  const { email } = req.body;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException('Email already exist');
  }

  const password = randomStr(32);
  const newCustomer = await createUserService({
    ...req.body,
    password,
    type: UserConstant.USER_TYPES.CUSTOMER,
  });

  if (req.file) {
    const result = await uploadImageBufferService({ file: req.file, folderName: 'avatars' });
    newCustomer.avatar = result.url;
  }

  await saveUserService(newCustomer);
  await sendPasswordService(email, password);

  const customersDto = Dto.new(CustomerDto, newCustomer.toObject());
  return ApiResponse.success(customersDto, 'Create customer successfully');
};

export const getAllCustomersController = async (req) => {
  let { keyword = '', limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }],
    type: UserConstant.USER_TYPES.CUSTOMER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const customers = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const customersDto = Dto.newList(CustomerDto, customers);
  return ApiResponse.success({ meta: metaData, list: customersDto }, 'Get all customers successfully');
};

export const getCustomerByIdController = async (req) => {
  const { id } = req.params;
  const customer = await getUserByIdService(id);
  if (!customer) {
    throw new NotFoundException('Customer not found');
  }

  const customerDto = Dto.new(CustomerDto, customer);
  return ApiResponse.success(customerDto, 'Get customer successfully');
};

export const updateCustomerByIdController = async (req) => {
  const { id } = req.params;
  const { email } = req.body;
  const existCustomer = await getUserByIdService(id, 'id');
  if (!existCustomer) {
    throw new NotFoundException('Customer not found');
  }

  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw new ConflictException('Email already exist');
    }
  }

  let updatedCustomer = await updateUserInfoByIdService(id, req.body);

  if (req.file) {
    updatedCustomer = await updateUserAvatarByIdService(id, req.file, updatedCustomer?.avatar);
  }

  const customerDto = Dto.new(CustomerDto, updatedCustomer);
  return ApiResponse.success(customerDto, 'Update customer successfully');
};

export const removeCustomerByIdController = async (req) => {
  const { id } = req.params;
  const existCustomer = await getUserByIdService(id, 'id');
  if (!existCustomer) {
    throw new NotFoundException('Customer not found');
  }

  const removedCustomer = await removeUserByIdService(id);

  const customerDto = Dto.new(CustomerDto, removedCustomer);
  return ApiResponse.success(customerDto, 'Remove customer successfully');
};
