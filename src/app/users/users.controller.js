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
  checkExistUserByIdService,
} from '#app/users/users.service';
import { checkExistRoleByIdService } from '#app/roles/roles.service';
import { userSchemaDto } from '#app/users/dto/user-schema.dto';
import { sendPasswordService } from '#modules/mailer/mailer.service';
import { ConflictException, NotFoundException } from '#core/exception/http-exception';
import { USER_TYPES } from '#core/constant';
import { ApiResponse } from '#core/api/ApiResponse';
import { Assert } from '#core/assert/Assert';
import { randomStr } from '#utils/string.util';
import { calculatePagination } from '#utils/pagination.util';
import { plainToSchema, plainToArraySchema } from '#utils/schema-transformer';

export const createUserController = async (req) => {
  const { email, roleId } = req.body;

  const isExistEmail = await checkExistEmailService(email);
  Assert.isTrue(isExistEmail, new ConflictException('Email already exist'));

  if (roleId) {
    const isExistRole = await checkExistRoleByIdService(roleId);
    Assert.isTrue(isExistRole, new NotFoundException('Role not found'));
  }

  const password = randomStr(32);
  const createdUser = await createUserService({
    ...req.body,
    password,
    type: USER_TYPES.USER,
  });

  // Send password to mail for user
  await sendPasswordService(email, password);

  // Update avatar
  if (req.file) {
    await updateUserAvatarByIdService(createdUser._id, req.file);
  }

  const userSchema = plainToSchema(userSchemaDto, createdUser);
  return ApiResponse.statusCode(HttpStatus.CREATED).success(userSchema);
};

export const getAllUsersController = async (req) => {
  let { keyword = '', limit, page } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }],
    type: USER_TYPES.USER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const users = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const usersSchema = plainToArraySchema(userSchemaDto, users);
  return ApiResponse.statusCode(HttpStatus.OK).success({ meta: metaData, list: usersSchema });
};

export const getUserByIdController = async (req) => {
  const { userId } = req.params;

  const user = await getUserByIdService(userId);
  Assert.isTrue(!!user, new NotFoundException('User not found'));

  const userSchema = plainToSchema(userSchemaDto, user);
  return ApiResponse.statusCode(HttpStatus.OK).success(userSchema);
};

export const updateUserByIdController = async (req) => {
  const { userId } = req.params;
  const { email, roleId } = req.body;

  const isExistUser = await checkExistUserByIdService(userId);
  Assert.isTrue(isExistUser, new NotFoundException('User not found'));

  if (email) {
    const isExistEmail = await checkExistEmailService(email, userId);
    Assert.isTrue(isExistEmail, new ConflictException('Email already exist'));
  }

  if (roleId) {
    const isExistRole = await checkExistRoleByIdService(roleId);
    Assert.isTrue(isExistRole, new NotFoundException('Role not found'));
  }

  // Update basic info
  await updateUserInfoByIdService(id, req.body);

  // Update avatar
  if (req.file) {
    await updateUserAvatarByIdService(id, req.file);
  }

  return ApiResponse.statusCode(HttpStatus.NO_CONTENT);
};

export const removeUserByIdController = async (req) => {
  const { userId } = req.params;

  const isExistUser = await checkExistUserByIdService(userId);
  Assert.isTrue(isExistUser, new NotFoundException('User not found'));

  await removeUserByIdService(userId);

  return ApiResponse.statusCode(HttpStatus.NO_CONTENT);
};

export const checkExistEmailController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);

  return ApiResponse.statusCode(HttpStatus.OK).success(isExistEmail);
};
