import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { HttpException } from '#src/core/exception/http-exception';
import { checkExistEmailService, getProfileByIdService, updateUserInfoByIdService } from '#src/app/users/users.service';
import { UserDto } from '#src/app/users/dtos/user.dto';
import {
  comparePasswordService,
  getListPermissionNameInUserService,
  getListNotificationInUserService,
  markAsReadNotificationInUserService,
  countListUnreadNotificationInUserService,
  markAllAsReadNotificationInUserService,
  getAllUnreadNotificationInUserService,
  getListUserNotificationService,
} from '#src/app/account/account.service';
import { changePasswordByIdService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { validateSchema } from '#src/core/validations/request.validation';
import { EditProfileDto } from '#src/app/account/dtos/edit-profile.dto';
import { ChangePasswordDto } from '#src/app/account/dtos/change-password.dto';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { AccountPermissionDto } from '#src/app/account/dtos/account-permission.dto';
import { UserNotificationDto } from '#src/app/account/dtos/user-notifications.dto';
import { MarkAsReadNotificationDto } from '#src/app/account/dtos/mark-as-read-notification.dto';
import { GetListNotificationInUserDto } from '#src/app/account/dtos/get-list-notification-in-user.dto';
import { CreateOrderCustomerDto } from '#src/app/account/dtos/create-order-customer.';
import { createOrderJob } from '#src/app/orders/orders.worker';
import { getOrderByIdService } from '#src/app/orders/orders.service';
import { OrderDto } from '#src/app/orders/dtos/order.dto';
import { notifyClientsOfNewOrder } from '#src/app/notifications/notifications.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { deleteUserFromCache, getUserFromCache, setUserToCache } from '#src/app/users/users-cache.service';
import {
  deleteCustomerFromCache,
  getCustomerFromCache,
  setCustomerToCache,
} from '#src/app/customers/customers-cache.service';
import { deleteOrderFromCache } from '#src/app/orders/orders-cache.service';

export const getProfileController = async (req) => {
  const { id, type } = req.user;

  let user = type === USER_TYPE.USER ? await getUserFromCache(id) : await getCustomerFromCache(id);
  if (!user) {
    user = await getProfileByIdService(id);
    const setToCache = type === USER_TYPE.USER ? setUserToCache : setCustomerToCache;
    await setToCache(id, user);
  }

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const editProfileController = async (req) => {
  const { id, type } = req.user;
  const adapter = await validateSchema(EditProfileDto, req.body);

  const isExistEmail = await checkExistEmailService(adapter.email, id);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  if (adapter.avatar && adapter.avatar instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: adapter.avatar, folderName: 'avatar' });
    adapter.avatar = result.url;
  }

  const updatedUser = await updateUserInfoByIdService(id, adapter);

  const deleteFromCache = type === USER_TYPE.USER ? deleteUserFromCache : deleteCustomerFromCache;
  await deleteFromCache(id);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const changePasswordController = async (req) => {
  const userId = req.user.id;
  const adapter = await validateSchema(ChangePasswordDto, req.body);

  const isMatch = await comparePasswordService(userId, adapter.password);
  if (!isMatch) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Password is incorrect' });
  }

  await changePasswordByIdService(userId, adapter.newPassword);

  return ApiResponse.success(true);
};

export async function createOrderByCustomerController(req) {
  const { id } = req.user;

  const adapter = await validateSchema(CreateOrderCustomerDto, req.body);

  // Validation
  const customer = await getCustomerByIdService(id, { type: USER_TYPE.CUSTOMER });
  if (!customer) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
  }

  const province = await getProvinceService(adapter.provinceCode);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const district = await getDistrictService(adapter.districtCode, adapter.provinceCode);
  if (!district) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const ward = await getWardService(adapter.wardCode, adapter.districtCode);
  if (!ward) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' });
  }

  const fullAddress = `${adapter.address}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;

  // const validAddress = await checkValidAddressService(fullAddress);
  // if (!validAddress) {
  //   throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Invalid address' });
  // }

  // Logic (CREATE ORDER PENDING)
  const job = await createOrderJob({
    customerId: customer._id,
    customerName: adapter.customerName,
    customerEmail: adapter.customerEmail,
    customerPhone: adapter.customerPhone,
    provinceName: province.ProvinceName,
    districtName: district.DistrictName,
    wardName: ward.WardName,
    address: adapter.address,
    productVariants: adapter.productVariants,
    paymentMethod: adapter.paymentMethod,
    baseUrl: req.protocol + '://' + req.get('host'),
  });
  const newOrder = await job.waitUntilFinished(orderQueueEVent);

  // Clear cache
  await deleteOrderFromCache(newOrder._id);

  // Transform
  const orderDetail = await getOrderByIdService(newOrder._id);
  const orderDto = ModelDto.new(OrderDto, orderDetail);

  // Notify to client
  await notifyClientsOfNewOrder({
    orderId: orderDto.id,
    code: orderDto.code,
    total: orderDto.total,
  });

  return ApiResponse.success(orderDto);
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

  const skip = (adapter.page - 1) * adapter.limit;
  const userNotifications = await getListNotificationInUserService(
    userId,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const totalCountUnreadNotification = await countListUnreadNotificationInUserService(userId);

  const userNotificationsDto = ModelDto.newList(UserNotificationDto, userNotifications);
  return ApiResponse.success(
    { notifications: userNotificationsDto, totalUnread: totalCountUnreadNotification },
    'Get list notification successful',
  );
};

export const markAsReadNotificationInUserController = async (req) => {
  const userId = req.user.id;
  const adapter = await validateSchema(MarkAsReadNotificationDto, req.params);

  const userNotification = await markAsReadNotificationInUserService(userId, adapter.userNotificationId);
  if (!userNotification) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Notification not found' });
  }

  const userNotificationDto = ModelDto.new(UserNotificationDto, userNotification);
  return ApiResponse.success(userNotificationDto, 'Mark as read notification successful');
};

export const markAllAsReadNotificationInUserController = async (req) => {
  const userId = req.user.id;

  const [unreadList] = await Promise.all([
    getAllUnreadNotificationInUserService(userId),
    markAllAsReadNotificationInUserService(userId),
  ]);

  if (unreadList.length === 0) {
    return ApiResponse.success([], 'No unread notifications to mark as read');
  }

  const updatedList = await getListUserNotificationService({
    _id: { $in: unreadList.map((item) => item._id) },
  });

  const userNotificationsDto = ModelDto.newList(UserNotificationDto, updatedList);
  return ApiResponse.success(userNotificationsDto, 'Mark all as read notification successful');
};
