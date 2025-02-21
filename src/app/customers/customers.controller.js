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
} from '#app/users/users.service';
import { USER_TYPES } from '#core/constant';
import { randomStr } from '#utils/string.util';
import { sendPasswordService } from '#modules/mailer/mailer.service';
import { calculatePagination } from '#utils/pagination.util';

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
    type: USER_TYPES.CUSTOMER,
  });

  await sendPasswordService(email, password);

  if (req.file) {
    await updateUserAvatarByIdService(newCustomer._id, req.file);
  }

  const formatterCustomer = await getUserByIdService(newCustomer._id);

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Create customer successfully',
    data: formatterCustomer,
  };
};

export const getAllCustomersController = async (req) => {
  let { keyword = '', limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }],
    type: USER_TYPES.CUSTOMER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const customers = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'Get all customers successfully',
    data: { meta: metaData, list: customers },
  };
};

export const getCustomerByIdController = async (req) => {
  const { id } = req.params;
  const existCustomer = await getUserByIdService(id);
  if (!existCustomer) {
    throw new NotFoundException('Customer not found');
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'Get customer successfully',
    data: existCustomer,
  };
};

export const updateCustomerByIdController = async (req) => {
  const { id } = req.params;
  const { email } = req.body;
  const existCustomer = await getUserByIdService(id, '_id');
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

  return {
    statusCode: HttpStatus.OK,
    message: 'Update customer successfully',
    data: updatedCustomer,
  };
};

export const removeCustomerByIdController = async (req) => {
  const { id } = req.params;
  const existCustomer = await getUserByIdService(id, '_id');
  if (!existCustomer) {
    throw new NotFoundException('Customer not found');
  }

  const removedCustomer = await removeUserByIdService(id);

  return {
    statusCode: HttpStatus.OK,
    message: 'Remove customer successfully',
    data: removedCustomer,
  };
};
