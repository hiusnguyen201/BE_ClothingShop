import { OrderModel } from '#src/app/orders/models/orders.model';
import { isValidObjectId } from 'mongoose';

/**
 * New order
 * @param {*} data
 * @returns
 */
export function newOrderService(data) {
  return new OrderModel(data);
}

export async function createOrdersService(data, session) {
  return await OrderModel.create(data, { session });
}

export async function getAllOrdersByUserService({ filters, offset = 0, limit = 10, sortOptions }) {
  return await OrderModel.find(filters).skip(offset).limit(limit).sort(sortOptions).lean();
}

/**
 * Find one order by id
 * @param {*} id
 * @returns
 */
export async function getOrderByIdService(orderId) {
  if (!orderId) return null;
  const filter = {};

  if (isValidObjectId(orderId)) {
    filter._id = orderId;
  } else {
    return null;
  }

  return await OrderModel.findOne({
    _id: orderId,
  }).populate('paymentId');
}

export async function updateOrderByIdService(orderId, data, session) {
  return await OrderModel.findByIdAndUpdate(orderId, data, {
    new: true,
    session
  });
}

export async function removeOrderByIdService(orderId) {
  return await OrderModel.findByIdAndDelete(orderId);
}

export async function countAllOrdersService(filters) {
  return OrderModel.countDocuments(filters);
}

export const calculateOrderTotalService = async (productVariantDetails) => {
  let subTotal = 0;
  let totalQuantity = 0;
  let shippingFee = 0;
  let discountProduct = 0;

  const orderDetails = productVariantDetails.map((variant) => {
    const totalPrice = variant.unitPrice * variant.quantity - discountProduct;
    subTotal += totalPrice;
    totalQuantity += variant.quantity;
    return { ...variant, totalPrice, discountProduct };
  });

  //fee
  const total = subTotal + shippingFee - discountVoucher;
  return { subTotal, total, totalQuantity, orderDetails };
};
