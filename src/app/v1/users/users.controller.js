import HttpStatus from 'http-status-codes';
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserInfoByIdService,
  countAllUsersService,
  saveUserService,
} from '#app/v1/users/users.service';
import { getRoleByIdService } from '#app/v1/roles/roles.service';
import { sendPasswordService } from '#modules/mailer/mailer.service';
import { ConflictException, NotFoundException } from '#core/exception/http-exception';
import { randomStr } from '#utils/string.util';
import { UserConstant } from '#app/v2/users/UserConstant';
import { calculatePagination } from '#utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { Dto } from '#src/core/dto/Dto';
import { UserDto } from '#src/app/v1/users/dtos/user.dto';

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
  const user = await createUserService({
    ...req.body,
    password,
    type: UserConstant.USER_TYPES.USER,
  });

  await saveUserService(user);

  // Send password to mail for user
  await sendPasswordService(email, password);

  const userDto = Dto.newList(UserDto, user);
  return ApiResponse.success(userDto);
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

  const usersDto = Dto.newList(UserDto, users);
  return ApiResponse.success({ meta: metaData, list: usersDto });
};

export const getUserByIdController = async (req) => {
  const { id } = req.params;
  const user = await getUserByIdService(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const userDto = Dto.new(UserDto, user);
  return ApiResponse.success(userDto);
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

  const updatedUser = await updateUserInfoByIdService(id, req.body);

  const userDto = Dto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const removeUserByIdController = async (req) => {
  const { id } = req.params;

  const existUser = await getUserByIdService(id);
  if (!existUser) {
    throw new NotFoundException('User not found');
  }

  const removedUser = await removeUserByIdService(id);

  const userDto = Dto.new(UserDto, removedUser);
  return ApiResponse.success(userDto);
};

export const checkExistEmailController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);

  return ApiResponse.success(isExistEmail);
};
