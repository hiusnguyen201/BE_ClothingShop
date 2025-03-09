import { getUserByIdService } from '#src/app/v1/users/users.service';
import {
  createOrderService,
  getAllOrdersByUserService,
  getOrderByIdService,
  updateOrderByIdService,
  removeOrderByIdService,
} from '#src/app/v1/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { BadRequestException, NotFoundException } from '#src/core/exception/http-exception';
import { createOrderDetailService } from '#src/app/v1/orderDetails/order-details.service';
import { ORDERS_STATUS } from '#src/core/constant';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { UserConstant } from '#src/app/v2/users/UserConstant';
import { calculateCartTotal } from '#src/utils/calculateCareTotal';
import moment from 'moment-timezone';
import { randomCodeOrder } from '#src/utils/string.util';

/**
 *  Tạo order từ quản trị
 */
export const createOrderController = async (req, res) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { productVariantIds, customerId, voucherId } = req.body;

    const customerExisted = await getUserByIdService(customerId);

    if (!customerExisted || customerExisted.type !== UserConstant.USER_TYPES.CUSTOMER) {
      throw new NotFoundException('User not found');
    }
    if (!productVariantIds || productVariantIds.length === 0) {
      throw new BadRequestException('Product not found');
    }
    const calculateOrderDetails = await calculateCartTotal(productVariantIds, voucherId);

    const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const code = randomCodeOrder(14);

    const createOrderRequirement = {
      code,
      customerId: customerExisted._id,
      customerName: req.body.customerName || customerExisted.name,
      customerEmail: req.body.customerEmail || customerExisted.email,
      customerPhone: req.body.customerPhone || customerExisted.phone,
      shippingAddress: req.body.shippingAddress,
      quantity: calculateOrderDetails.totalQuantity,
      subTotal: calculateOrderDetails.subTotal,
      shippingFee: 0,
      orderDate: orderDate,
      total: calculateOrderDetails.total,
      status: ORDERS_STATUS.PENDING,
      voucherId: voucherId || null,
    };

    const newOrder = await createOrderService(createOrderRequirement, session);

    const newOrderDetails = calculateOrderDetails.processedVariants.map((item) => ({
      ...item,
      totalPrice: calculateOrderDetails.total,
      orderId: newOrder._id,
    }));

    // Thêm session
    await createOrderDetailService(newOrderDetails);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Create order successfully',
      data: newOrder,
    };
  });
};

/**
 * lấy tất cả order bên quản trị
 * Thêm sắp xếp (mới nhất, cũ nhất, theo khoảng thời gian tính theo orderDate) và lọc (status)
 */
export const getAllOrdersByUserController = async (req, res) => {
  let { keyword = '', limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { code: { $regex: keyword, $options: 'i' } }],
  };

  const orders = await getAllOrdersByUserService(req.user._id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Get all order successfully',
    data: orders,
  };
};

export const getOrderByIdController = async (req, res) => {
  const existOrder = await getOrderByIdService(req.params.id);
  if (!existOrder) {
    throw new NotFoundException('Order not found');
  }
  return {
    statusCode: HttpStatus.OK,
    message: 'Get one order successfully',
    data: existOrder,
  };
};

export const updateOrderByIdController = async (req, res) => {
  const existOrder = await getOrderByIdService(req.params.id);
  if (!existOrder) {
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
  const existOrder = await getOrderByIdService(req.params.id);
  if (!existOrder) {
    throw new NotFoundException('Order not found');
  }
  await removeOrderByIdService(req.params.id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Remove order successfully',
    data: {},
  };
};
