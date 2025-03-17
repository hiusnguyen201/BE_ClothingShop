'use strict';
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserInfoByIdService,
  countAllUsersService,
  saveUserService,
} from '#src/app/v1/users/users.service';
import { getRoleByIdService } from '#src/app/v1/roles/roles.service';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import { HttpException } from '#src/core/exception/http-exception';
import { randomStr } from '#src/utils/string.util';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { calculatePagination } from '#src/utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { UserDto } from '#src/app/v1/users/dtos/user.dto';
import { Code } from '#src/core/code/Code';

export const createUserController = async (req) => {
  const { email, role } = req.body;

  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  if (role) {
    const existRole = await getRoleByIdService(role);
    if (!existRole) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
    }
  }

  const password = randomStr(32);
  const user = await createUserService({
    ...req.body,
    password,
    type: USER_TYPE.USER,
  });

  await saveUserService(user);

  // Send password to mail for user
  sendPasswordService(email, password);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const getAllUsersController = async (req) => {
  let { keyword = '', limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }],
    type: USER_TYPE.USER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const users = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const usersDto = ModelDto.newList(UserDto, users);
  return ApiResponse.success({ meta: metaData, list: usersDto });
};

export const getUserByIdController = async (req) => {
  const { id } = req.params;
  const user = await getUserByIdService(id);
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const updateUserByIdController = async (req) => {
  const { id } = req.params;

  const existUser = await getUserByIdService(id);
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const { email, role } = req.body;
  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
    }
  }

  if (role) {
    const existRole = await getRoleByIdService(role);
    if (!existRole) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
    }
  }

  const updatedUser = await updateUserInfoByIdService(id, req.body);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const removeUserByIdController = async (req) => {
  const { id } = req.params;

  const existUser = await getUserByIdService(id);
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const removedUser = await removeUserByIdService(id);

  const userDto = ModelDto.new(UserDto, removedUser);
  return ApiResponse.success(userDto);
};

export const checkExistEmailController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);

  return ApiResponse.success(isExistEmail);
};
