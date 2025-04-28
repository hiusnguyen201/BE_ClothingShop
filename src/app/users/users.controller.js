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
import { USER_TYPE } from '#src/app/users/users.constant';
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

  sendPasswordService(adapter.email, password);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const getAllUsersController = async (req) => {
  const adapter = await validateSchema(GetListUserDto, req.query);

  const searchFields = ['name', 'email', 'phone'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
    ...(adapter.gender ? { gender: adapter.gender } : {}),
    ...(adapter.roleId ? { role: adapter.roleId } : {}),
    type: USER_TYPE.USER,
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, users] = await getAndCountUsersService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const usersDto = ModelDto.newList(UserDto, users);
  return ApiResponse.success({ totalCount, list: usersDto });
};

export const getUserByIdController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const user = await getUserByIdService(adapter.userId, { type: USER_TYPE.USER });
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const updateUserByIdController = async (req) => {
  const adapter = await validateSchema(UpdateUserDto, { ...req.params, ...req.body });

  const existUser = await getUserByIdService(adapter.userId, { type: USER_TYPE.USER });
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const isExistEmail = await checkExistEmailService(adapter.email, existUser._id);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  if (adapter.roleId) {
    const existRole = await getRoleByIdService(adapter.roleId);
    if (!existRole) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
    }
  }

  const updatedUser = await updateUserInfoByIdService(existUser._id, { ...adapter, role: adapter.roleId });

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const removeUserByIdController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const existUser = await getUserByIdService(adapter.userId, { type: USER_TYPE.USER });
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  await removeUserByIdService(existUser._id);

  return ApiResponse.success({ id: existUser._id }, 'Remove user successful');
};

export const resetPasswordUserController = async (req) => {
  const adapter = await validateSchema(GetUserDto, req.params);

  const existUser = await getUserByIdService(adapter.userId, { type: USER_TYPE.USER });
  if (!existUser) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const newPassword = randomStr(32);
  await updateUserPasswordService(existUser._id, newPassword);

  await sendPasswordService(existUser.email, newPassword);

  return ApiResponse.success({ id: existUser._id }, 'Reset user password successful');
};

// export const getListUserPermissionsController = async (req) => {
//   const { userId } = req.params;

//   const existUser = await getUserByIdService(userId, { type: USER_TYPE.USER });
//   if (!existUser) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
//   }

//   const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

//   const searchFields = ['name', 'description', 'module'];
//   const filters = {
//     $or: searchFields.map((field) => ({
//       [field]: { $regex: keyword, $options: 'i' },
//     })),
//   };

//   const skip = (page - 1) * limit;
//   const [totalCount, permissions] = await getAndCountUserPermissionsService(
//     userId,
//     filters,
//     skip,
//     limit,
//     sortBy,
//     sortOrder,
//   );

//   const permissionsDto = ModelDto.newList(PermissionDto, permissions);
//   return ApiResponse.success({ totalCount, list: permissionsDto }, 'Get all user permissions successful');
// };

// export const addUserPermissionsController = async (req) => {
//   const { userId } = req.params;
//   const { permissionIds } = req.body;

//   const user = await getUserByIdService(userId, { type: USER_TYPE.USER });
//   if (!user) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
//   }

//   const filters = {
//     _id: { $in: permissionIds },
//   };

//   const permissions = await getPermissionsService(filters);

//   await addUserPermissionsService(
//     user._id,
//     permissions.filter(Boolean).map((item) => item._id),
//   );

//   const permissionsDto = ModelDto.newList(PermissionDto, permissions);
//   return ApiResponse.success(permissionsDto, 'Add user permissions successful');
// };

// export const removeUserPermissionController = async (req) => {
//   const { userId, permissionId } = req.params;

//   const userPermission = await getUserPermissionService(userId, permissionId);
//   if (!userPermission) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
//   }

//   const permission = await getPermissionByIdService(permissionId);
//   if (!permission) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
//   }

//   if (userPermission.permissions.length === 0) {
//     throw HttpException.new({
//       code: Code.RESOURCE_NOT_FOUND,
//       overrideMessage: 'Permission does not exist in the user',
//     });
//   }

//   await removeUserPermissionByIdService(userPermission._id, permission._id);

//   return ApiResponse.success({ id: permission._id }, 'Remove user permission successful');
// };
