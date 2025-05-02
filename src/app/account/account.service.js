import { compare } from 'bcrypt';
import { UserModel } from '#src/app/users/models/user.model';
import { UserNotificationModel } from '#src/app/notifications/models/user-notification.model';
import { USER_NOTIFICATION_SELECTED_FIELDS } from '#src/app/notifications/notifications.constant';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';

export async function comparePasswordService(userId, password) {
  const user = await UserModel.findById(userId).select({ password: true }).lean();
  return compare(password, user.password);
}

/**
 * Get list notification in user
 * @param {string} userId
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getListNotificationInUserService(userId, skip, limit, sortBy, sortOrder) {
  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  return UserNotificationModel.find({ user: userId }, USER_NOTIFICATION_SELECTED_FIELDS, queryOptions)
    .populate({
      path: 'notification',
    })
    .lean();
}

/**
 * Get list user notification
 * @param {string} userId
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getListUserNotificationService(filters, skip, limit, sortBy, sortOrder) {
  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  return UserNotificationModel.find(filters, USER_NOTIFICATION_SELECTED_FIELDS, queryOptions)
    .populate({
      path: 'notification',
    })
    .lean();
}

/**
 * Count list unread notification in user
 * @param {string} userId
 * @returns
 */
export async function countListUnreadNotificationInUserService(userId) {
  return UserNotificationModel.countDocuments({ user: userId, isRead: false });
}

/**
 * Mark as read notification in user
 * @param {string} userId
 * @param {string} userNotificationId
 * @returns
 */
export async function markAsReadNotificationInUserService(userId, userNotificationId) {
  return UserNotificationModel.findOneAndUpdate(
    {
      _id: userNotificationId,
      user: userId,
    },
    {
      isRead: true,
      readAt: new Date(),
    },
    {
      new: true,
    },
  );
}

/**
 * Get all unread notification in user
 * @param {string} userId
 * @returns
 */
export async function getAllUnreadNotificationInUserService(userId) {
  return UserNotificationModel.find({
    user: userId,
    isRead: false,
  });
}

/**
 * Mark all as read notifications in user
 * @param {string} userId
 * @returns
 */
export async function markAllAsReadNotificationInUserService(userId) {
  return UserNotificationModel.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    },
  );
}

/**
 * Get user permission
 * @param {string} userId
 * @param {string} permissionId
 * @returns
 */
export async function getUserPermissionService(userId, permissionId) {
  return UserModel.findById(userId)
    .populate({
      path: 'permissions',
      select: 'method, endpoint',
      match: { _id: permissionId },
    })
    .select('permissions')
    .lean();
}

/**
 * Get user permissions
 * @param {string} userId
 * @param {string} permissionId
 * @returns
 */
export async function getListPermissionNameInUserService(userId) {
  const user = await UserModel.findById(userId)
    .populate({
      path: 'role',
      select: '_id permissions',
      populate: {
        path: 'permissions',
        select: 'name',
        options: {
          lean: true,
        },
      },
      options: {
        lean: true,
      },
    })
    .populate({
      path: 'permissions',
      select: 'name',
    })
    .lean();

  return [...user.permissions.map((item) => item.name), ...(user?.role?.permissions?.map((item) => item.name) || [])];
}
