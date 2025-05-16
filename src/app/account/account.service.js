import {
  comparePasswordRepository,
  countListUnreadNotificationInUserRepository,
  getAllUnreadNotificationInUserRepository,
  getAndCountListNotificationInUserRepository,
  getListPermissionNameInUserRepository,
  getListUserNotificationRepository,
  markAllAsReadNotificationInUserRepository,
  markAsReadNotificationInUserRepository,
} from '#src/app/account/account.repository';
import { deleteCustomerFromCache } from '#src/app/customers/customers.cache';
import { deleteUserFromCache } from '#src/app/users/users.cache';
import { USER_TYPE } from '#src/app/users/users.constant';
import {
  checkExistEmailRepository,
  updatePasswordByIdService,
  updateUserInfoByIdRepository,
} from '#src/app/users/users.repository';
import { Assert } from '#src/core/assert/Assert';
import { Code } from '#src/core/code/Code';
import { HttpException } from '#src/core/exception/http-exception';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';

export async function getListPermissionNameInUserService(userId) {
  return await getListPermissionNameInUserRepository(userId);
}

export async function editProfileService(payload) {
  const isExistEmail = await checkExistEmailRepository(payload.email, payload.userId);
  Assert.isFalse(
    isExistEmail,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' }),
  );

  if (payload.avatar && payload.avatar instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: payload.avatar, folderName: 'avatar' });
    payload.avatar = result.url;
  }

  const updatedUser = await updateUserInfoByIdRepository(payload.userId, payload);

  const deleteFromCache = payload.type === USER_TYPE.USER ? deleteUserFromCache : deleteCustomerFromCache;
  await deleteFromCache(payload.userId);

  return updatedUser;
}

export async function changePasswordService(payload) {
  const isMatch = await comparePasswordRepository(payload.userId, payload.password);

  Assert.isTrue(isMatch, HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Password is incorrect' }));

  await updatePasswordByIdService(payload.userId, payload.newPassword);
}

export async function getListNotificationInUserService(payload) {
  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, notifies] = await getAndCountListNotificationInUserRepository(
    payload.userId,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );
  return [totalCount, notifies];
}

export async function countListUnreadNotificationInUserService(userId) {
  return await countListUnreadNotificationInUserRepository(userId);
}

export async function markAsReadNotificationInUserService(payload) {
  const userNotification = await markAsReadNotificationInUserRepository(payload.userId, payload.userNotificationId);
  Assert.isTrue(
    userNotification,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Notification not found' }),
  );
  return userNotification;
}

export async function markAllAsReadNotificationInUserService(payload) {
  const [unreadList] = await Promise.all([
    getAllUnreadNotificationInUserRepository(payload.userId),
    markAllAsReadNotificationInUserRepository(payload.userId),
  ]);

  if (unreadList.length === 0) return [];

  return await getListUserNotificationRepository({
    _id: { $in: unreadList.map((item) => item._id) },
  });
}
