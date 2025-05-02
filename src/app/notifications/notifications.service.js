import { io } from '#src/server';
import { NotificationModel } from '#src/app/notifications/models/notification.model';
import { UserNotificationModel } from '#src/app/notifications/models/user-notification.model';
import { NOTIFICATION_TYPE } from '#src/app/notifications/notifications.constant';
import { UserModel } from '#src/app/users/models/user.model';
import { NOTIFICATION_PERMISSIONS } from '#src/database/data/permissions-data';
import { ROLE_MODEL } from '#src/app/roles/models/role.model';
import { PERMISSION_MODEL } from '#src/app/permissions/models/permission.model';
import { DiscordService } from '#src/modules/discord/discord.service';

/**
 * New notification instance
 * @param {*} data
 * @returns
 */
export function newUserNotificationService(data) {
  return new UserNotificationModel(data);
}

/**
 * Notify client of new customer
 * @param {{customerId: string, name: string;email: string}} metadata
 * @returns
 */
export async function notifyClientsOfNewCustomer(metadata) {
  try {
    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.NEW_CUSTOMER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.NEW_CUSTOMER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    const notification = await NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.NEW_CUSTOMER,
    });

    io.emit(NOTIFICATION_TYPE.NEW_CUSTOMER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of new order
 * @param {{orderId: string, code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfNewOrder(metadata) {
  try {
    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.NEW_ORDER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.NEW_ORDER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    const notification = await NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.NEW_ORDER,
    });

    io.emit(NOTIFICATION_TYPE.NEW_ORDER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of low stock
 * @param {{productId: string, variantId: string, productName:string, quantity: number, variantValues: {optionName: string, optionValue: string}[]}} metadata
 * @returns
 */
export async function notifyClientsOfLowStock(metadata) {
  try {
    const usersPromise = UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.LOW_STOCK.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.LOW_STOCK.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    const notificationPromise = NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.LOW_STOCK,
    });

    const [users, notification] = await Promise.all([usersPromise, notificationPromise]);

    io.emit(NOTIFICATION_TYPE.LOW_STOCK, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of confirm order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfConfirmOrder(metadata) {
  try {
    const usersPromise = UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.CONFIRM_ORDER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.CONFIRM_ORDER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    const notificationPromise = NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.CONFIRM_ORDER,
    });

    const [users, notification] = await Promise.all([usersPromise, notificationPromise]);

    io.emit(NOTIFICATION_TYPE.CONFIRM_ORDER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of processing order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfProcessingOrder(metadata) {
  try {
    const usersPromise = UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.PROCESSING_ORDER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.PROCESSING_ORDER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    const notificationPromise = NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.PROCESSING_ORDER,
    });

    const [users, notification] = await Promise.all([usersPromise, notificationPromise]);

    io.emit(NOTIFICATION_TYPE.PROCESSING_ORDER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of ready for pickup order
 * @param {{orderId: string, customerName:string,code: number, total: number}} metadata
 * @returns
 */
export async function notifyClientsOfReadyForPickupOrder(metadata) {
  try {
    const usersPromise = UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.READY_FOR_PICKUP_ORDER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.READY_FOR_PICKUP_ORDER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    const notificationPromise = NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.READY_FOR_PICKUP_ORDER,
    });

    const [users, notification] = await Promise.all([usersPromise, notificationPromise]);

    io.emit(NOTIFICATION_TYPE.READY_FOR_PICKUP_ORDER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of shipping order
 * @param {{orderId: string, customerName:string,code: number;total: number, trackingNumber: string, estimatedDeliveryAt: Date}} metadata
 * @returns
 */
export async function notifyClientsOfShippingOrder(metadata) {
  try {
    const usersPromise = UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.SHIPPING_ORDER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.SHIPPING_ORDER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    const notificationPromise = NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.SHIPPING_ORDER,
    });

    const [users, notification] = await Promise.all([usersPromise, notificationPromise]);

    io.emit(NOTIFICATION_TYPE.SHIPPING_ORDER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of cancel order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfCancelOrder(metadata) {
  try {
    const usersPromise = UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.CANCEL_ORDER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.CANCEL_ORDER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    const notificationPromise = NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.CANCEL_ORDER,
    });

    const [users, notification] = await Promise.all([usersPromise, notificationPromise]);

    io.emit(NOTIFICATION_TYPE.CANCEL_ORDER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}

/**
 * Notify client of complete order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfCompleteOrder(metadata) {
  try {
    const usersPromise = UserModel.aggregate([
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'permissions',
          foreignField: '_id',
          as: 'userPermissions',
        },
      },
      {
        $lookup: {
          from: ROLE_MODEL,
          localField: 'role',
          foreignField: '_id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION_MODEL,
          localField: 'userRole.permissions',
          foreignField: '_id',
          as: 'rolePermissions',
        },
      },
      {
        $match: {
          $or: [
            { 'userPermissions.name': NOTIFICATION_PERMISSIONS.COMPLETE_ORDER.name },
            { 'rolePermissions.name': NOTIFICATION_PERMISSIONS.COMPLETE_ORDER.name },
          ],
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]).exec();

    const notificationPromise = NotificationModel.create({
      metadata,
      type: NOTIFICATION_TYPE.COMPLETE_ORDER,
    });

    const [users, notification] = await Promise.all([usersPromise, notificationPromise]);

    io.emit(NOTIFICATION_TYPE.COMPLETE_ORDER, metadata);

    const userNotifications = users.map((user) =>
      newUserNotificationService({ user: user._id, notification: notification._id }),
    );

    await UserNotificationModel.insertMany(userNotifications);
  } catch (err) {
    await DiscordService.sendError(err);
  }
}
