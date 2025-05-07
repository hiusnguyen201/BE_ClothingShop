import {
  createUserService,
  getUserByIdService,
  removeUserByIdService,
  checkExistEmailService,
  updateUserInfoByIdService,
  getAndCountUsersService,
  updateUserPasswordService,
} from '#src/app/users/users.service';
import { getRoleByIdService } from '#src/app/roles/roles.service';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import { HttpException } from '#src/core/exception/http-exception';
import { randomStr } from '#src/utils/string.util';
import { USER_SEARCH_FIELDS, USER_TYPE } from '#src/app/users/users.constant';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { Code } from '#src/core/code/Code';
import { CreateUserDto } from '#src/app/users/dtos/create-user.dto';
import { UpdateUserDto } from '#src/app/users/dtos/update-user.dto';
import { CheckExistEmailDto } from '#src/app/users/dtos/check-exist-email.dto';
import { GetListUserDto } from '#src/app/users/dtos/get-list-user.dto';
import { GetUserDto } from '#src/app/users/dtos/get-user.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import {
  deleteUserFromCache,
  getUserFromCache,
  setUserToCache,
  getTotalCountAndListUserFromCache,
  setTotalCountAndListUserToCache,
} from '#src/app/users/users-cache.service';

export const checkExistEmailController = async (req) => {
  const adapter = await validateSchema(CheckExistEmailDto, req.body);

  const isExistEmail = await checkExistEmailService(adapter.email);

  return ApiResponse.success(isExistEmail);
};

export const createUserController = async (req) => {
  const adapter = await validateSchema(CreateUserDto, req.body);

  const isExistEmail = await checkExistEmailService(adapter.email);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  if (adapter.roleId) {
    const existRole = await getRoleByIdService(adapter.roleId);
    if (!existRole) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
    }
    adapter.role = existRole._id;
  }

  const password = randomStr(32);
  const user = await createUserService({
    ...adapter,
    password,
    type: USER_TYPE.USER,
  });

  // Clear cache
  await deleteUserFromCache(user._id);

  sendPasswordService(adapter.email, password);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const getAllUsersController = async (req) => {
  const adapter = await validateSchema(GetListUserDto, req.query);

  const filters = {
    $or: USER_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
    ...(adapter.gender && { gender: adapter.gender }),
    ...(adapter.roleId && { role: adapter.roleId }),
  };

  let totalCount = 0;
  let users = [];
  const cached = await getTotalCountAndListUserFromCache({ ...adapter, ...filters });
  if (cached && Array.isArray(cached) && cached.length === 2) {
    const skip = (adapter.page - 1) * adapter.limit;
    [totalCount, users] = await getAndCountUsersService(
      filters,
      skip,
      adapter.limit,
      adapter.sortBy,
      adapter.sortOrder,
    );

    await setTotalCountAndListUserToCache(adapter, totalCount, users);
  }

  const usersDto = ModelDto.newList(UserDto, users);
  return ApiResponse.success({ totalCount: totalCount, list: usersDto }, 'Get list user successful');
};

export const getUserByIdController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  let user = await getUserFromCache(adapter.userId);
  if (!user) {
    user = await getUserByIdService(adapter.userId);
    await setUserToCache(adapter.userId, user);
  }

  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const userDto = ModelDto.new(UserDto, user);

  return ApiResponse.success(userDto, 'Get one user successful');
};

export const updateUserByIdController = async (req) => {
  const adapter = await validateSchema(UpdateUserDto, { ...req.params, ...req.body });

  const user = await getUserByIdService(adapter.userId);
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const isExistEmail = await checkExistEmailService(adapter.email, user._id);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  if (adapter.roleId) {
    const existRole = await getRoleByIdService(adapter.roleId);
    if (!existRole) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
    }
  }

  const updatedUser = await updateUserInfoByIdService(user._id, { ...adapter, role: adapter.roleId });

  // Clear cache
  await deleteUserFromCache(user._id);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const removeUserByIdController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const user = await getUserByIdService(adapter.userId);
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  await removeUserByIdService(user._id);

  // Clear cache
  await deleteUserFromCache(user._id);

  return ApiResponse.success({ id: user._id }, 'Remove user successful');
};

export const resetPasswordUserController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const existUser = await getUserByIdService(adapter.userId);
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const newPassword = randomStr(32);
  await updateUserPasswordService(existUser._id, newPassword);

  await sendPasswordService(existUser.email, newPassword);

  return ApiResponse.success({ id: existUser._id }, 'Reset user password successful');
};
