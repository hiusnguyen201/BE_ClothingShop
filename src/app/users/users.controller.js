'use strict';
import {
  createUserService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserInfoByIdService,
  getAndCountUserPermissionsService,
  addUserPermissionsService,
  removeUserPermissionByIdService,
  getAndCountUsersService,
  getUserPermissionService,
} from '#src/app/users/users.service';
import { getRoleByIdService } from '#src/app/roles/roles.service';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import { HttpException } from '#src/core/exception/http-exception';
import { randomStr } from '#src/utils/string.util';
import { USER_TYPE } from '#src/app/users/users.constant';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { Code } from '#src/core/code/Code';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';
import { getPermissionByIdService, getPermissionsService } from '#src/app/permissions/permissions.service';

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
    req.body.role = existRole._id;
  }

  const password = randomStr(32);
  const user = await createUserService({
    ...req.body,
    password,
    type: USER_TYPE.USER,
  });

  sendPasswordService(email, password);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const getAllUsersController = async (req) => {
  const {
    keyword = '',
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    roleId = null,
    gender,
  } = req.query;

  const searchFields = ['name', 'email', 'phone'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    })),
    ...(gender ? { gender } : {}),
    ...(roleId ? { role: roleId } : {}),
    type: USER_TYPE.USER,
  };

  const skip = (page - 1) * limit;
  const [totalCount, users] = await getAndCountUsersService(filters, skip, limit, sortBy, sortOrder);

  const usersDto = ModelDto.newList(UserDto, users);

  return ApiResponse.success({ totalCount, list: usersDto });
};

export const getUserByIdController = async (req) => {
  const { userId } = req.params;
  const user = await getUserByIdService(userId, { type: USER_TYPE.USER });
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const updateUserByIdController = async (req) => {
  const { userId } = req.params;
  const { email, roleId } = req.body;

  const existUser = await getUserByIdService(userId, { type: USER_TYPE.USER });
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

  const updatedUser = await updateUserInfoByIdService(userId, { ...req.body, role: roleId });

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const removeUserByIdController = async (req) => {
  const { userId } = req.params;

  const existUser = await getUserByIdService(userId, { type: USER_TYPE.USER });
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  await removeUserByIdService(userId);

  return ApiResponse.success({ id: existUser._id }, 'Remove user successful');
};

export const checkExistEmailController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);

  return ApiResponse.success(isExistEmail);
};

export const getListUserPermissionsController = async (req) => {
  const { userId } = req.params;

  const existUser = await getUserByIdService(userId, { type: USER_TYPE.USER });
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const searchFields = ['name', 'description', 'module'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    })),
  };

  const skip = (page - 1) * limit;
  const [totalCount, permissions] = await getAndCountUserPermissionsService(
    userId,
    filters,
    skip,
    limit,
    sortBy,
    sortOrder,
  );

  const permissionsDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success({ totalCount, list: permissionsDto }, 'Get all user permissions successful');
};

export const addUserPermissionsController = async (req) => {
  const { userId } = req.params;
  const { permissionIds } = req.body;

  const user = await getUserByIdService(userId, { type: USER_TYPE.USER });
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const filters = {
    _id: { $in: permissionIds },
  };

  const permissions = await getPermissionsService(filters);

  await addUserPermissionsService(
    user._id,
    permissions.filter(Boolean).map((item) => item._id),
  );

  const permissionsDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success(permissionsDto, 'Add user permissions successful');
};

export const removeUserPermissionController = async (req) => {
  const { userId, permissionId } = req.params;

  const userPermission = await getUserPermissionService(userId, permissionId);
  if (!userPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const permission = await getPermissionByIdService(permissionId);
  if (!permission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  if (userPermission.permissions.length === 0) {
    throw HttpException.new({
      code: Code.RESOURCE_NOT_FOUND,
      overrideMessage: 'Permission does not exist in the user',
    });
  }

  await removeUserPermissionByIdService(userPermission._id, permission._id);

  return ApiResponse.success({ id: permission._id }, 'Remove user permission successful');
};
