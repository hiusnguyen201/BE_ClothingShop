import { NotificationModel } from '#src/app/notifications/models/notification.model';
import { UserNotificationModel } from '#src/app/notifications/models/user-notification.model';

/**
 * New notification instance
 * @param {Object} data
 * @returns
 */
export function newUserNotificationRepository(data) {
  return new UserNotificationModel(data);
}

/**
 * Create notification
 * @param {Object} data
 * @returns
 */
export async function createNotificationRepository(data) {
  return await NotificationModel.create(data);
}

/**
 * Create user notifications
 * @param {Object[]} userNotifications
 * @returns
 */
export async function createUserNotificationsRepository(userNotifications) {
  return await UserNotificationModel.insertMany(userNotifications);
}
