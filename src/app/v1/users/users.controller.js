'use strict';
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserInfoByIdService,
  countAllUsersService,
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
  const { email, roleId } = req.body;

  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  if (roleId) {
    const existRole = await getRoleByIdService(roleId);
    if (!existRole) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
    }
  }

  const password = randomStr(32);
  const user = await createUserService({
    ...req.body,
    password,
  });

  // Send password to mail for user
  sendPasswordService(email, password);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const getAllUsersController = async (req) => {
  const { keyword, limit, page, status, sortBy, sortOrder, gender } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
      { phone: { $regex: keyword, $options: 'i' } },
    ],
    ...(status ? { status } : {}),
    ...(gender ? { gender } : {}),
    type: USER_TYPE.USER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const users = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
    sortBy,
    sortOrder,
  });

  const usersDto = ModelDto.newList(UserDto, users);
  return ApiResponse.success({ meta: metaData, list: usersDto });
};

export const getUserByIdController = async (req) => {
  const { userId } = req.params;
  const user = await getUserByIdService(userId);
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const updateUserByIdController = async (req) => {
  const { userId } = req.params;
  const { email, roleId } = req.body;

  const existUser = await getUserByIdService(userId);
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const isExistEmail = await checkExistEmailService(email, userId);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  if (roleId) {
    const existRole = await getRoleByIdService(roleId);
    if (!existRole) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
    }
  }

  const updatedUser = await updateUserInfoByIdService(userId, req.body);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const removeUserByIdController = async (req) => {
  const { userId } = req.params;

  const existUser = await getUserByIdService(userId);
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  await removeUserByIdService(userId);

  return ApiResponse.success();
};

export const checkExistEmailController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);

  return ApiResponse.success(isExistEmail);
};
