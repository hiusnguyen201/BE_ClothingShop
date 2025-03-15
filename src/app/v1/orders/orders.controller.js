import { getUserByIdService } from '#src/app/v1/users/users.service';
import {
  createOrderService,
  getAllOrdersByUserService,
  getOrderByIdService,
  updateOrderByIdService,
  removeOrderByIdService,
  countAllOrdersService,
} from '#src/app/v1/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { BadRequestException, NotFoundException } from '#src/core/exception/http-exception';
import { createOrderDetailService } from '#src/app/v1/orderDetails/order-details.service';
import { ORDERS_STATUS } from '#src/core/constant';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { calculateCartTotal } from '#src/utils/calculateCareTotal';
import moment from 'moment-timezone';
import { randomCodeOrder } from '#src/utils/string.util';
import {
  getShippingAddressByIdService,
  getShippingAddressByUserIdService,
} from '#src/app/v1/shipping-address/shipping-address.service';
import { createGHNOrder, getOrderGhnByClientOrderCode, removeOrderGhn } from '#src/modules/GHN/ghn.service';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { calculatePagination } from '#src/utils/pagination.util';

/**
 *  Tạo order từ quản trị
 */
export const createOrderController = async (req, res) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { productVariantIds, customerId, voucherId, shippingAddressId } = req.body;

    const customerExisted = await getUserByIdService(customerId);

    if (!customerExisted || customerExisted.type !== USER_TYPE.CUSTOMER) {
      throw new NotFoundException('User not found');
    }

    const userExisted = await getUserByIdService(req.user._id);

    if (!productVariantIds || productVariantIds.length === 0) {
      throw new NotFoundException('Product not found');
    }
    const calculateOrderDetails = await calculateCartTotal(productVariantIds, voucherId);

    const shippingAddressExisted = await getShippingAddressByIdService(shippingAddressId);

    if (!shippingAddressExisted) {
      throw new NotFoundException('Address not found');
    }

    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const code = randomCodeOrder(14);

    const createOrderRequirement = {
      code,
      provinceName: shippingAddressExisted.province,
      districtName: shippingAddressExisted.district,
      wardName: shippingAddressExisted.ward,
      address: shippingAddressExisted.address,
      customerId: customerExisted._id,
      customerName: req.body.customerName || customerExisted.name,
      customerEmail: req.body.customerEmail || customerExisted.email,
      customerPhone: req.body.customerPhone || customerExisted.phone,
      shippingAddressId: shippingAddressExisted._id,
      quantity: calculateOrderDetails.totalQuantity,
      subTotal: calculateOrderDetails.subTotal,
      shippingFee: 0,
      orderDate: currentDate,
      total: calculateOrderDetails.total,
      isPath: false,
      status: ORDERS_STATUS.PENDING,
      voucherId: voucherId || null,
    };

    const newOrder = await createOrderService(createOrderRequirement, session);

    const userAddress = await getShippingAddressByUserIdService(userExisted._id);

    const newOrderGhn = await createGHNOrder(newOrder, userExisted, userAddress, calculateOrderDetails);

    if (!newOrderGhn) {
      throw new BadRequestException('Can not create order by GHN');
    }

    const newOrderDetails = calculateOrderDetails.processedVariants.map((item) => ({
      ...item,
      totalPrice: calculateOrderDetails.total,
      orderId: newOrder._id,
    }));

    // Thêm session
    await createOrderDetailService(newOrderDetails, session);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Create order successfully',
      data: { newOrder, calculateOrderDetails },
    };
  });
};

/**
 *  Tạo order từ customer
 */
export const createOrderCustomerController = async (req, res) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { cartIds, voucherId, shippingAddressId } = req.body;

    const customerExisted = await getUserByIdService(req.user._id);

    if (!cartIds || cartIds.length === 0) {
      throw new NotFoundException('Product not found');
    }
    const calculateOrderDetails = await calculateCartTotal(cartIds, voucherId);

    const shippingAddressExisted = await getShippingAddressByIdService(shippingAddressId);

    if (!shippingAddressExisted) {
      throw new NotFoundException('Address not found');
    }

    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const code = randomCodeOrder(14);

    const createOrderRequirement = {
      code,
      provinceName: shippingAddressExisted.province,
      districtName: shippingAddressExisted.district,
      wardName: shippingAddressExisted.ward,
      address: shippingAddressExisted.address,
      customerId: customerExisted._id,
      customerName: req.body.customerName || customerExisted.name,
      customerEmail: req.body.customerEmail || customerExisted.email,
      customerPhone: req.body.customerPhone || customerExisted.phone,
      shippingAddressId: shippingAddressExisted._id,
      quantity: calculateOrderDetails.totalQuantity,
      subTotal: calculateOrderDetails.subTotal,
      shippingFee: 0,
      orderDate: currentDate,
      total: calculateOrderDetails.total,
      isPath: false,
      status: ORDERS_STATUS.PENDING,
      voucherId: voucherId || null,
    };

    const newOrder = await createOrderService(createOrderRequirement, session);

    const userAddress = await getShippingAddressByUserIdService(customerExisted._id);

    const newOrderGhn = await createGHNOrder(newOrder, customerExisted, userAddress, calculateOrderDetails);

    if (!newOrderGhn) {
      throw new BadRequestException('Can not create order by GHN');
    }

    const newOrderDetails = calculateOrderDetails.processedVariants.map((item) => ({
      ...item,
      totalPrice: calculateOrderDetails.total,
      orderId: newOrder._id,
    }));

    // Thêm session
    await createOrderDetailService(newOrderDetails, session);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Create order customer successfully',
      data: { newOrder, calculateOrderDetails },
    };
  });
};

/**
 * lấy tất cả order bên quản trị
 * Thêm sắp xếp (mới nhất, cũ nhất, theo khoảng thời gian tính theo orderDate) và lọc (status)
 */
export const getAllOrdersByUserController = async (req, res) => {
  let { keyword = '', limit = 10, page = 1, status, startDate, endDate, sortBy } = req.query;

  let filterOptions = {};

  if (keyword) {
    filterOptions.$or = [
      { customerName: { $regex: keyword, $options: 'i' } },
      { code: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (startDate && endDate) {
    filterOptions.orderDate = {
      $gte: moment(startDate, 'YYYY-MM-DD').startOf('day').toDate(), // 00:00:00
      $lte: moment(endDate, 'YYYY-MM-DD').endOf('day').toDate(),
    };
  }

  if (status) {
    filterOptions.status = status;
  }

  // Sort by oldest newest
  let sortOptions = { orderDate: -1 };
  if (sortBy === 'oldest') {
    sortOptions.orderDate = 1;
  }

  const totalCount = await countAllOrdersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const orders = await getAllOrdersByUserService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
    sortOptions,
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'Get all order successfully',
    data: orders,
  };
};

export const getOrderByIdController = async (req, res) => {
  const orderExisted = await getOrderByIdService(req.params.id);
  if (!orderExisted) {
    throw new NotFoundException('Order not found');
  }
  return {
    statusCode: HttpStatus.OK,
    message: 'Get one order successfully',
    data: orderExisted,
  };
};

export const updateOrderByIdController = async (req, res) => {
  const orderExisted = await getOrderByIdService(req.params.id);
  if (!orderExisted) {
    throw new NotFoundException('Order not found');
  }

  const orderUpdated = await updateOrderByIdService(req.params.id, req.body);
  return {
    statusCode: HttpStatus.OK,
    message: 'Update order successfully',
    data: orderUpdated,
  };
};

export const removeOrderByIdController = async (req, res) => {
  const orderExisted = await getOrderByIdService(req.params.id);
  if (!orderExisted) {
    throw new NotFoundException('Order not found');
  }

  const orderGhn = await getOrderGhnByClientOrderCode(orderExisted.code);
  if (!orderGhn) {
    throw new NotFoundException('Order not found');
  }

  await removeOrderGhn(orderGhn.order_code);

  await removeOrderByIdService(req.params.id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Remove order successfully',
    data: {},
  };
};
