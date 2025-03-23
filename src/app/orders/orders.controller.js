import {
  getAllOrdersByUserService,
  getOrderByIdService,
  updateOrderByIdService,
  removeOrderByIdService,
  countAllOrdersService,
} from '#src/app/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { HttpException } from '#src/core/exception/http-exception';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import moment from 'moment-timezone';
import { createGhnOrder, getOrderGhnByClientOrderCode, removeOrderGhn } from '#src/modules/GHN/ghn.service';
import { calculatePagination } from '#src/utils/pagination.util';
import { Code } from '#src/core/code/Code';
import { handleCreateOrder } from '#src/utils/handle-create-order';
import { ORDERS_STATUS } from '#src/core/constant';
import { getOrderDetailsByOrderIdService } from '#src/app/orderDetails/order-details.service';

export const createOrderController = async (req, res) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const newOrder = await handleCreateOrder(req.body.productVariants, req, session);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Create order successfully',
      data: newOrder,
    };
  });
};

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
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
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
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
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
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const orderGhn = await getOrderGhnByClientOrderCode(orderExisted.code);
  if (!orderGhn) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order Ghn not found' });
  }

  await removeOrderGhn(orderGhn.order_code);

  await removeOrderByIdService(req.params.id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Remove order successfully',
    data: {},
  };
};

export const createOrderGhnController = async (req, res) => {
  const { orderId } = req.body;
  const orderExisted = await getOrderByIdService(orderId);

  if (!orderExisted || !orderExisted.paymentId) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found ' });
  }

  const orderDetails = await getOrderDetailsByOrderIdService(orderExisted._id);

  const newOrderGhn = await createGhnOrder(orderExisted, orderDetails);

  if (!newOrderGhn) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Create order ghn false' });
  }

  await updateOrderByIdService(orderExisted._id, {
    status: ORDERS_STATUS.PROCESSING,
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'Create order ghn successfully',
    data: { newOrderGhn },
  };
};
