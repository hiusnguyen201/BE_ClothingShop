import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { EditProfileDto } from '#src/app/account/dtos/edit-profile.dto';
import { ChangePasswordDto } from '#src/app/account/dtos/change-password.dto';
import { AccountPermissionDto } from '#src/app/account/dtos/account-permission.dto';
import { UserNotificationDto } from '#src/app/account/dtos/user-notifications.dto';
import { MarkAsReadNotificationDto } from '#src/app/account/dtos/mark-as-read-notification.dto';
import { GetListNotificationInUserDto } from '#src/app/account/dtos/get-list-notification-in-user.dto';
import { CreateOrderCustomerDto } from '#src/app/account/dtos/create-order-customer.';
import { createOrderService, getOrderByIdService } from '#src/app/orders/orders.service';
import { OrderDto } from '#src/app/orders/dtos/order.dto';
import { USER_TYPE } from '#src/app/users/users.constant';
import { getCustomerByIdOrFailService } from '#src/app/customers/customers.service';
import { getTrackingDetailsService } from '#src/modules/GHN/ghn.service';
import { clearCartService } from '#src/app/carts/carts.service';
import { GetAllOrdersInCustomerDto } from '#src/app/account/dtos/get-all-orders-in-customer.dto';
import { getAllOrdersInCustomerService } from '#src/app/orders/orders.service';
import { GetCustomerOrderDto } from '#src/app/account/dtos/get-customer-order.dto';
import {
  changePasswordService,
  countListUnreadNotificationInUserService,
  editProfileService,
  getListNotificationInUserService,
  getListPermissionNameInUserService,
  markAllAsReadNotificationInUserService,
  markAsReadNotificationInUserService,
} from '#src/app/account/account.service';
import { getUserByIdOrFailService } from '#src/app/users/users.service';

export const getProfileController = async (req) => {
  const { id, type } = req.user;

  const user =
    type === USER_TYPE.USER
      ? await getUserByIdOrFailService({ userId: id })
      : await getCustomerByIdOrFailService({ customerId: id });

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const editProfileController = async (req) => {
  const adapter = await validateSchema(EditProfileDto, req.body);

  const updatedUser = await editProfileService({ ...adapter, userId: req.user.id, type: req.user.type });

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const changePasswordController = async (req) => {
  const userId = req.user.id;
  const adapter = await validateSchema(ChangePasswordDto, req.body);

  await changePasswordService({ ...adapter, userId });

  return ApiResponse.success(null);
};

export async function createOrderByCustomerController(req) {
  const adapter = await validateSchema(CreateOrderCustomerDto, req.body);

  const order = await createOrderService({
    ...adapter,
    customerId: req.user.id,
    baseUrl: req.protocol + '://' + req.get('host'),
  });

  await clearCartService(req.user.id);

  const orderDto = ModelDto.new(OrderDto, order);
  return ApiResponse.success(orderDto, 'Create order successful');
}

// Uncache
export const getListPermissionsInUserController = async (req) => {
  const userId = req.user.id;

  const permissions = await getListPermissionNameInUserService(userId);

  const permissionsDto = ModelDto.newList(AccountPermissionDto, permissions);
  return ApiResponse.success(permissionsDto, 'Get list permission successful');
};

export const getListNotificationInUserController = async (req) => {
  const userId = req.user.id;
  const adapter = await validateSchema(GetListNotificationInUserDto, req.query);

  const [totalCount, userNotifications] = await getListNotificationInUserService({ ...adapter, userId });

  const totalCountUnreadNotification = await countListUnreadNotificationInUserService(userId);

  const userNotificationsDto = ModelDto.newList(UserNotificationDto, userNotifications);
  return ApiResponse.success(
    { notifications: userNotificationsDto, totalUnread: totalCountUnreadNotification, totalCount },
    'Get list notification successful',
  );
};

export const markAsReadNotificationInUserController = async (req) => {
  const adapter = await validateSchema(MarkAsReadNotificationDto, req.params);

  const userNotification = await markAsReadNotificationInUserService({
    ...adapter,
    userId: req.user.id,
  });

  const userNotificationDto = ModelDto.new(UserNotificationDto, userNotification);
  return ApiResponse.success(userNotificationDto, 'Mark as read notification successful');
};

export const markAllAsReadNotificationInUserController = async (req) => {
  const userNotifications = await markAllAsReadNotificationInUserService({
    userId: req.user.id,
  });

  const userNotificationsDto = ModelDto.newList(UserNotificationDto, userNotifications);
  return ApiResponse.success(
    userNotificationsDto,
    userNotificationsDto.length > 0
      ? 'Mark all as read notification successful'
      : 'No unread notifications to mark as read',
  );
};

export async function getAllOrdersInCustomerController(req) {
  const adapter = await validateSchema(GetAllOrdersInCustomerDto, { ...req.query, customerId: req.user.id });

  const [totalCount, orders] = await getAllOrdersInCustomerService(adapter);

  const ordersDto = ModelDto.newList(OrderDto, orders);
  return ApiResponse.success({ totalCount, list: ordersDto });
}

export const getCustomerOrderByIdController = async (req) => {
  const adapter = await validateSchema(GetCustomerOrderDto, { ...req.params, customerId: req.user.id });

  const order = await getOrderByIdService(adapter);

  const trackingLog = order.trackingNumber ? await getTrackingDetailsService(order.trackingNumber) : null;

  const orderDto = ModelDto.new(OrderDto, { ...order, trackingLog });
  return ApiResponse.success(orderDto);
};
