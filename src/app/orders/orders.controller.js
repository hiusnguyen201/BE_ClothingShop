import {
  getAllOrdersByUserService,
  getOrderByIdService,
  updateOrderByIdService,
  removeOrderByIdService,
  countAllOrdersService,
  createOrdersService,
  calculateOrderTotalService,
  newOrderService,
} from '#src/app/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { HttpException } from '#src/core/exception/http-exception';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import moment from 'moment-timezone';
import {
  createGhnOrder,
  getOrderGhnByClientOrderCode,
  removeOrderGhn
} from '#src/modules/GHN/ghn.service';
import { Code } from '#src/core/code/Code';
import { ORDERS_STATUS, PAYMENT_METHOD } from '#src/core/constant';
import { createOrderDetailService, getOrderDetailsByOrderIdService, newOrderDetailService } from '#src/app/orderDetails/order-details.service';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { OrderDto } from '#src/app/orders/dtos/order.dto';
import { getProductVariantByIdService } from '#src/app/product-variants/product-variants.service';
import { randomCodeOrder } from '#src/utils/string.util';
import { calculateDiscount } from '#src/utils/handle-create-order';

export const createOrderController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { customerName, customerEmail, customerPhone, customerAddress, productVariants, paymentMethod } = req.body;

    const newOrder = newOrderService({
      code: randomCodeOrder(14),
      customerName,
      customerEmail,
      customerPhone,
      provinceName: customerAddress.province,
      districtName: customerAddress.district,
      wardName: customerAddress.ward,
      address: customerAddress.address,
      orderDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      shippingDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      quantity: 0,
      subTotal: 0,
      shippingFee: 0,
      total: 0,
      isPaid: false,
      status: ORDERS_STATUS.PENDING
    });

    const orderDetails = await Promise.all(productVariants.map(async (productVariant) => {
      const productVariantExited = await getProductVariantByIdService(productVariant.variantId);
      if (!productVariantExited) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
      }
      if (productVariantExited.quantity < productVariant.quantity) {
        throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Product variant quantity not enough' });
      }

      let productVariantPrice = productVariantExited.price;

      const orderDetail = newOrderDetailService({
        quantity: productVariant.quantity,
        unitPrice: productVariantPrice,
        orderId: newOrder._id,
        productId: productVariantExited.product._id,
        variantId: productVariantExited._id
      })

      if (productVariantExited.productDiscount) {
        orderDetail.discount = productVariantExited.productDiscount.amount;
        orderDetail.isFixed = productVariantExited.productDiscount.isFixed;
        orderDetail.unitPrice = calculateDiscount(productVariantPrice, orderDetail.discount, orderDetail.isFixed);
      }
      orderDetail.totalPrice = orderDetail.unitPrice * productVariant.quantity;

      await orderDetail.save({ session })
      return orderDetail;
    }));

    const calcResult = orderDetails.reduce((acc, item) => {
      acc.totalQuantity += item.quantity;
      acc.totalPriceSum += item.totalPrice;
      return acc;
    }, { totalQuantity: 0, totalPriceSum: 0 });

    newOrder.quantity = calcResult.totalQuantity;
    const subTotal = calcResult.totalPriceSum;
    newOrder.subTotal = subTotal;
    newOrder.total = subTotal + 0; // + ship fee

    await newOrder.save({ session });

    const orderDto = ModelDto.new(OrderDto, newOrder);
    return ApiResponse.success(orderDto);
  });
};

export const getAllOrdersByUserController = async (req) => {
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

export const getOrderByIdController = async (req) => {
  const orderExisted = await getOrderByIdService(req.params.id);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }
  const orderDto = ModelDto.new(OrderDto, orderExisted);
  return ApiResponse.success(orderDto);
};

export const updateOrderByIdController = async (req) => {
  const orderExisted = await getOrderByIdService(req.params.id);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const orderUpdated = await updateOrderByIdService(req.params.id, req.body);
  const orderDto = ModelDto.new(OrderDto, orderUpdated);
  return ApiResponse.success(orderDto);
};

export const removeOrderByIdController = async (req) => {
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
  const orderDto = ModelDto.new(OrderDto, orderExisted);
  return ApiResponse.success(orderDto);
  return {
    statusCode: HttpStatus.OK,
    message: 'Remove order successfully',
    data: {},
  };
};

export const createOrderGhnController = async (req) => {
  const { orderId } = req.body;
  const orderExisted = await getOrderByIdService(orderId);

  if (!orderExisted || !orderExisted.paymentId) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
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
