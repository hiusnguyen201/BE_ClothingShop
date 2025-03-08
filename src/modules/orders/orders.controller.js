import { getUserByIdService } from "#src/modules/users/users.service";
import {
  createOrderService,
  getAllOrdersByUserService,
  getOrderByIdService,
  updateOrderByIdService,
  removeOrderByIdService,
} from "#src/modules/orders/orders.service";
import HttpStatus from "http-status-codes";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { getVoucherByIdService } from "#src/modules/vouchers/vouchers.service";
import { createOrderDetailService } from "#src/modules/orderDetails/order-details.service";
import { ORDERS_STATUS } from "#src/core/constant";

export const createOrderController = async (req, res) => {
  const user = await getUserByIdService(req.user._id);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const { orderDetails, shipping_fee, voucherId } = req.body;

  if (!orderDetails || orderDetails.length === 0) {
    throw new BadRequestException("Cart not found");
  }

  //total order details
  let sub_total = 0;
  const orderDetailDocs = orderDetails.map((item) => {
    const total_price = item.quantity * item.unit_price - item.discount;
    sub_total += total_price;
    return { ...item, total_price };
  });

  //check voucher
  const voucherExisted = await getVoucherByIdService(voucherId);
  let discountVoucher = 0;
  if (voucherExisted.isFixed) {
    discountVoucher = voucherExisted.discount;
  } else {
    discountVoucher = (sub_total * voucherExisted.discount) / 100;
  }

  const total = sub_total + (shipping_fee || 0) - discountVoucher;

  const createOrderRequirement = {
    customer_name: req.body.customer_name || user.name,
    customer_email: req.body.customer_email || user.email,
    customer_phone: req.body.customer_phone || user.phone,
    shipping_address: req.body.shipping_address,
    quantity: orderDetailDocs.length,
    sub_total,
    shipping_fee: req.body.shipping_fee || 0,
    total,
    status: ORDERS_STATUS.PENDING,
    orderDetails: req.body.orderDetails,
    voucherId: voucherExisted._id || null,
    customerId: user._id,
  };

  const newOrder = await createOrderService({ ...createOrderRequirement });
  const orderDetailRecords = orderDetailDocs.map((item) => ({
    ...item,
    orderId: newOrder._id,
  }));

  await createOrderDetailService(orderDetailRecords);
  return {
    statusCode: HttpStatus.CREATED,
    message: "Create order successfully",
    data: newOrder,
  };
};

export const getAllOrdersByUserController = async (req, res) => {
  let { keyword = "", limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { code: { $regex: keyword, $options: "i" } },
    ],
  };

  const orders = await getAllOrdersByUserService(req.user._id);
  return {
    statusCode: HttpStatus.OK,
    message: "Get all order successfully",
    data: orders,
  };
};

export const getOrderByIdController = async (req, res) => {
  const existOrder = await getOrderByIdService(req.params.id);
  if (!existOrder) {
    throw new NotFoundException("Order not found");
  }
  return {
    statusCode: HttpStatus.OK,
    message: "Get one order successfully",
    data: existOrder,
  };
};

export const updateOrderByIdController = async (req, res) => {
  const existOrder = await getOrderByIdService(req.params.id);
  if (!existOrder) {
    throw new NotFoundException("Order not found");
  }

  const orderUpdated = await updateOrderByIdService(req.params.id, req.body);
  return {
    statusCode: HttpStatus.OK,
    message: "Update order successfully",
    data: orderUpdated,
  };
};

export const removeOrderByIdController = async (req, res) => {
  const existOrder = await getOrderByIdService(req.params.id);
  if (!existOrder) {
    throw new NotFoundException("Order not found");
  }
  await removeOrderByIdService(req.params.id);
  return {
    statusCode: HttpStatus.OK,
    message: "Remove order successfully",
    data: {},
  };
};
