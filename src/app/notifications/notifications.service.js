import { io } from '#src/server';
import { NOTIFICATION_CHANNEL, NOTIFICATION_TYPE } from '#src/app/notifications/notifications.constant';
import { NOTIFICATION_PERMISSIONS } from '#src/database/data/permissions-data';
import { DiscordService } from '#src/modules/discord/discord.service';
import { getUsersByPermissionNameRepository } from '#src/app/users/users.repository';
import {
  createNotificationRepository,
  createUserNotificationsRepository,
  newUserNotificationRepository,
} from '#src/app/notifications/notifications.repository';

/**
 * Notify client of new customer
 * @param {{customerId: string, name: string;email: string}} metadata
 * @returns
 */
export async function notifyClientsOfNewCustomer(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.NEW_CUSTOMER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.NEW_CUSTOMER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of new order
 * @param {{orderId: string, code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfNewOrder(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.NEW_ORDER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.NEW_ORDER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of low stock
 * @param {{productId: string, variantId: string, productName:string, quantity: number, variantValues: {optionName: string, optionValue: string}[]}} metadata
 * @returns
 */
export async function notifyClientsOfLowStock(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.LOW_STOCK.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.LOW_STOCK,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of confirm order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfConfirmOrder(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.CONFIRM_ORDER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.CONFIRM_ORDER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of processing order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfProcessingOrder(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.PROCESSING_ORDER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.PROCESSING_ORDER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of ready for pickup order
 * @param {{orderId: string, customerName:string,code: number, total: number}} metadata
 * @returns
 */
export async function notifyClientsOfReadyForPickupOrder(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.READY_FOR_PICKUP_ORDER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.READY_FOR_PICKUP_ORDER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of shipping order
 * @param {{orderId: string, customerName:string,code: number;total: number, trackingNumber: string, estimatedDeliveryAt: Date}} metadata
 * @returns
 */
export async function notifyClientsOfShippingOrder(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.SHIPPING_ORDER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.SHIPPING_ORDER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of cancel order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfCancelOrder(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.CANCEL_ORDER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.CANCEL_ORDER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}

/**
 * Notify client of complete order
 * @param {{orderId: string, customerName:string,code: number;total: number}} metadata
 * @returns
 */
export async function notifyClientsOfCompleteOrder(metadata) {
  try {
    const users = await getUsersByPermissionNameRepository(NOTIFICATION_PERMISSIONS.COMPLETE_ORDER.name);

    const notification = await createNotificationRepository({
      metadata,
      type: NOTIFICATION_TYPE.COMPLETE_ORDER,
    });

    io.emit(NOTIFICATION_CHANNEL);

    const userNotifications = users.map((user) =>
      newUserNotificationRepository({ user: user._id, notification: notification._id }),
    );

    await createUserNotificationsRepository(userNotifications);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    await DiscordService.sendError(err.message);
  }
}
