import {
  createUserRepository,
  getUserByIdRepository,
  removeUserByIdRepository,
  checkExistEmailRepository,
  updateUserInfoByIdRepository,
  getAndCountUsersRepository,
  updateUserPasswordRepository,
} from '#src/app/users/users.repository';
import { getRoleByIdRepository } from '#src/app/roles/roles.repository';
import { sendPasswordService } from '#src/modules/mailer/mailer.service';
import { HttpException } from '#src/core/exception/http-exception';
import { randomStr } from '#src/utils/string.util';
import { USER_SEARCH_FIELDS, USER_TYPE } from '#src/app/users/users.constant';
import { Code } from '#src/core/code/Code';
import {
  deleteUserFromCache,
  getUserFromCache,
  setUserToCache,
  getUsersFromCache,
  setUsersToCache,
} from '#src/app/users/users.cache';
import { Assert } from '#src/core/assert/Assert';

/**
 * @typedef {import("#src/app/users/models/user.model").UserModel} UserModel
 * @typedef {import("#src/app/users/dtos/check-exist-email.dto").CheckExistEmailDto} CheckExistEmailPort
 * @typedef {import("#src/app/users/dtos/create-user.dto").CreateUserDto} CreateUserPort
 * @typedef {import("#src/app/users/dtos/get-list-user.dto").GetListUserDto} GetListUserPort
 * @typedef {import("#src/app/users/dtos/get-user.dto").GetUserDto} GetUserPort
 * @typedef {import("#src/app/users/dtos/update-user.dto").UpdateUserDto} UpdateUserPort
 */

/**
 * Check exist email
 * @param {CheckExistEmailPort} payload
 * @returns {Promise<boolean>}
 */
export const checkExistEmailService = async (payload) => {
  return await checkExistEmailRepository(payload.email);
};

/**
 * Create user
 * @param {CreateUserPort} payload
 * @returns {Promise<UserModel>}
 */
export const createUserService = async (payload) => {
  const isExistEmail = await checkExistEmailRepository(payload.email);
  Assert.isFalse(
    isExistEmail,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' }),
  );

  if (payload.roleId) {
    const existRole = await getRoleByIdRepository(payload.roleId);
    Assert.isTrue(existRole, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));
  }

  const password = randomStr(32);
  const user = await createUserRepository({
    ...payload,
    password,
    type: USER_TYPE.USER,
    role: payload.roleId,
  });

  // Clear cache
  await deleteUserFromCache(user._id);

  sendPasswordService(payload.email, password);

  return user;
};

/**
 * Get all users
 * @param {GetListUserPort} payload
 * @returns {Promise<[number, UserModel[]]>}
 */
export const getAllUsersService = async (payload) => {
  const filters = {
    $or: USER_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
    ...(payload.gender && { gender: payload.gender }),
    ...(payload.roleId && { role: payload.roleId }),
    ...(payload.status && {
      verifiedAt: {
        ...(payload.status === 'active' ? { $ne: null } : { $eq: null }),
      },
    }),
  };

  const cached = await getUsersFromCache(payload);
  if (cached && Array.isArray(cached) && cached.length === 2 && cached[0] > 0 && cached[0] > 0) {
    return cached;
  }

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, users] = await getAndCountUsersRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  await setUsersToCache(payload, totalCount, users);

  return [totalCount, users];
};

/**
 * Get user
 * @param {GetUserPort} payload
 * @returns {Promise<UserModel>}
 */
export const getUserByIdOrFailService = async (payload) => {
  const cached = await getUserFromCache(payload.userId);
  if (cached) {
    return cached;
  }

  const user = await getUserByIdRepository(payload.userId);
  Assert.isTrue(user, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' }));

  await setUserToCache(payload.userId, user);

  return user;
};

/**
 * Update user
 * @param {UpdateUserPort} payload
 * @returns {Promise<UserModel>}
 */
export const updateUserByIdOrFailService = async (payload) => {
  const user = await getUserByIdRepository(payload.userId);
  Assert.isTrue(user, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' }));

  const isExistEmail = await checkExistEmailRepository(payload.email, user._id);
  Assert.isFalse(
    isExistEmail,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' }),
  );

  if (payload.roleId) {
    const existRole = await getRoleByIdRepository(payload.roleId);
    Assert.isTrue(existRole, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));
  }

  const updatedUser = await updateUserInfoByIdRepository(user._id, { ...payload, role: payload.roleId });

  // Clear cache
  await deleteUserFromCache(user._id);

  return updatedUser;
};

/**
 * Remove user
 * @param {GetUserPort} payload
 * @returns {Promise<{id: string}>}
 */
export const removeUserByIdOrFailService = async (payload) => {
  const user = await getUserByIdRepository(payload.userId);
  Assert.isTrue(user, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' }));

  await removeUserByIdRepository(user._id);

  // Clear cache
  await deleteUserFromCache(user._id);

  return { id: user._id };
};

/**
 * Reset password user
 * @param {GetUserPort} payload
 * @returns {Promise<{id: string}>}
 */
export const resetPasswordUserByIdOrFailService = async (payload) => {
  const existUser = await getUserByIdRepository(payload.userId);
  Assert.isTrue(existUser, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' }));

  const newPassword = randomStr(32);
  await updateUserPasswordRepository(existUser._id, newPassword);

  await sendPasswordService(existUser.email, newPassword);

  return { id: existUser._id };
};
