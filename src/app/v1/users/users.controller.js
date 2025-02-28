import HttpStatus from 'http-status-codes';
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserAvatarByIdService,
  updateUserInfoByIdService,
  countAllUsersService,
} from '#app/v1/users/users.service';
import { getRoleByIdService } from '#app/v1/roles/roles.service';
import { sendPasswordService } from '#modules/mailer/mailer.service';
import { ConflictException, NotFoundException } from '#core/exception/http-exception';
import { randomStr } from '#utils/string.util';
import { UserConstant } from '#app/v2/users/UserConstant';
import { makeHash } from '#utils/bcrypt.util';
import { calculatePagination } from '#utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';

export const createUserController = async (req) => {
  const { email, role } = req.body;

  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException('Email already exist');
  }

  if (role) {
    const existRole = await getRoleByIdService(role);
    if (!existRole) {
      throw new NotFoundException('Role not found');
    }
  }

  const password = randomStr(32);
  const hashedPassword = makeHash(password);
  const newUser = await createUserService({
    ...req.body,
    password: hashedPassword,
    type: UserConstant.USER_TYPES.USER,
  });

  // Send password to mail for user
  sendPasswordService(email, password);

  // Update avatar
  if (req.file) {
    await updateUserAvatarByIdService(newUser._id, req.file);
  }

  const formatterUser = await getUserByIdService(newUser._id);

  return ApiResponse.statusCode(HttpStatus.CREATED).success(formatterUser);
};

export const getAllUsersController = async (req) => {
  let { keyword = '', limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }],
    type: UserConstant.USER_TYPES.USER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const users = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return ApiResponse.statusCode(HttpStatus.OK).success({ meta: metaData, list: users });
};

export const getUserByIdController = async (req) => {
  const { id } = req.params;
  const existUser = await getUserByIdService(id);
  if (!existUser) {
    throw new NotFoundException('User not found');
  }

  return ApiResponse.statusCode(HttpStatus.OK).success(existUser);
};

export const updateUserByIdController = async (req) => {
  const { id } = req.params;

  const existUser = await getUserByIdService(id, '_id');
  if (!existUser) {
    throw new NotFoundException('User not found');
  }

  const { email, role } = req.body;
  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw new ConflictException('Email already exist');
    }
  }

  if (role) {
    const existRole = await getRoleByIdService(role);
    if (!existRole) {
      throw new NotFoundException('Role not found');
    }
  }

  // Update basic info
  let updatedUser = await updateUserInfoByIdService(id, req.body);

  // Update avatar
  if (req.file) {
    updatedUser = await updateUserAvatarByIdService(id, req.file, updatedUser?.avatar);
  }

  return ApiResponse.statusCode(HttpStatus.OK).success(updatedUser);
};

export const removeUserByIdController = async (req) => {
  const { id } = req.params;

  const existUser = await getUserByIdService(id);
  if (!existUser) {
    throw new NotFoundException('User not found');
  }

  const removedUser = await removeUserByIdService(id);
  return ApiResponse.statusCode(HttpStatus.OK).success(removedUser);
};

export const checkExistEmailController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);

  return ApiResponse.statusCode(HttpStatus.OK).success(isExistEmail);
};
