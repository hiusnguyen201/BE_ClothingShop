import { getUserByIdService } from '#src/app/users/users.service';
import {
  createOrderService,
  getAllOrdersByUserService,
  getOrderByIdService,
  updateOrderByIdService,
  removeOrderByIdService,
  countAllOrdersService,
  calculateOrderTotalService,
} from '#src/app/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { HttpException } from '#src/core/exception/http-exception';
import { createOrderDetailService } from '#src/app/orderDetails/order-details.service';
import { ORDERS_STATUS } from '#src/core/constant';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import moment from 'moment-timezone';
import { randomCodeOrder } from '#src/utils/string.util';
import { getShippingAddressByIdService } from '#src/app/shipping-address/shipping-address.service';
import { createGHNOrder, getOrderGhnByClientOrderCode, removeOrderGhn } from '#src/modules/GHN/ghn.service';
import { calculatePagination } from '#src/utils/pagination.util';
import { getCustomerByIdService } from '#src/app/customers/customers.service';
import { getVariantProductByIdService } from '#src/app/products/product.service';
import { getVoucherByIdService } from '#src/app/vouchers/vouchers.service';
import { Code } from '#src/core/code/Code';

/**
 *  Tạo order từ quản trị
 */
export const createOrderController = async (req, res) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { productVariants, customerId, voucherId, shippingAddressId } = req.body;

    const customerExisted = await getCustomerByIdService(customerId);
    if (!customerExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
    }

    const variantIds = productVariants.map((item) => item.variantId);

    const productVariantsExited = await getVariantProductByIdService(variantIds);

    if (!productVariantsExited) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
    }

    const productVariantDetails = productVariants.map((item) => {
      const variant = productVariantsExited.find((v) => v._id.toString() === item.variantId);
      return {
        variantId: variant._id,
        productId: variant.productId._id,
        unitPrice: variant.price,
        sku: variant.sku,
        quantity: item.quantity,
      };
    });

    const voucherExisted = await getVoucherByIdService(voucherId);

    const calculateOrderDetails = await calculateOrderTotalService(productVariantDetails, voucherExisted);

    const shippingAddressExisted = await getShippingAddressByIdService(shippingAddressId);

    if (!shippingAddressExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Address not found' });
    }

    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const code = randomCodeOrder(14);

    const createOrderRequirement = {
      code,
      provinceName: req.body.provinceName || shippingAddressExisted.province,
      districtName: req.body.districtName || shippingAddressExisted.district,
      wardName: req.body.wardName || shippingAddressExisted.ward,
      address: req.body.address || shippingAddressExisted.address,
      customerId: customerExisted._id,
      customerName: req.body.customerName || customerExisted.name,
      customerEmail: req.body.customerEmail || customerExisted.email,
      customerPhone: req.body.customerPhone || customerExisted.phone,
      shippingAddressId: req.body.shippingAddressId || shippingAddressExisted._id,
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

    const newOrderDetails = calculateOrderDetails.orderDetails.map((item) => ({
      ...item,
      orderId: newOrder._id,
    }));

    await createOrderDetailService(newOrderDetails, session);

    // if (newOrder.paymentId) {
    //   const newOrderGhn = await createGHNOrder(newOrder, calculateOrderDetails);
    //   if (!newOrderGhn) {
    //     throw new BadRequestException('Can not create order by GHN');
    //   }
    // }

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
    const { cartIds, customerId, voucherId, shippingAddressId } = req.body;

    const customerExisted = await getCustomerByIdService(customerId);
    if (!customerExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
    }

    const variantIds = cartIds.map((item) => item.variantId);

    const productVariantsExited = await getVariantProductByIdService(variantIds);

    if (!productVariantsExited) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
    }
    const productVariantDetails = cartIds.map((item) => {
      const variant = productVariantsExited.find((v) => v._id.toString() === item.variantId);
      return {
        variantId: variant._id,
        productId: variant.productId._id,
        unitPrice: variant.price,
        sku: variant.sku,
        quantity: item.quantity,
      };
    });

    const voucherExisted = await getVoucherByIdService(voucherId);

    const calculateOrderDetails = await calculateOrderTotalService(productVariantDetails, voucherExisted);

    const shippingAddressExisted = await getShippingAddressByIdService(shippingAddressId);

    if (!shippingAddressExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Address not found' });
    }

    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const code = randomCodeOrder(14);

    const createOrderRequirement = {
      code,
      provinceName: req.body.provinceName || shippingAddressExisted.province,
      districtName: req.body.districtName || shippingAddressExisted.district,
      wardName: req.body.wardName || shippingAddressExisted.ward,
      address: req.body.address || shippingAddressExisted.address,
      customerId: customerExisted._id,
      customerName: req.body.customerName || customerExisted.name,
      customerEmail: req.body.customerEmail || customerExisted.email,
      customerPhone: req.body.customerPhone || customerExisted.phone,
      shippingAddressId: req.body.shippingAddressId || shippingAddressExisted._id,
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

    const newOrderDetails = calculateOrderDetails.orderDetails.map((item) => ({
      ...item,
      orderId: newOrder._id,
    }));

    await createOrderDetailService(newOrderDetails, session);

    // if (newOrder.paymentId) {
    //   const newOrderGhn = await createGHNOrder(newOrder, calculateOrderDetails);
    //   if (!newOrderGhn) {
    //     throw new BadRequestException('Can not create order by GHN');
    //   }
    // }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Create order successfully',
      data: { newOrder, calculateOrderDetails },
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
