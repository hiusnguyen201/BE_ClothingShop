import { OrderModel } from '#src/app/orders/schema/orders.schema';

export async function createOrderService(data, session) {
  return await OrderModel.create(data);
}

export async function getAllOrdersByUserService({ filters, offset = 0, limit = 10, sortOptions }) {
  const orders = await OrderModel.find(filters).skip(offset).limit(limit).sort(sortOptions).lean();
  return orders;
}

export async function getOrderByIdService(orderId) {
  const order = await OrderModel.findOne({
    _id: orderId,
  }).populate('paymentId');
  return order;
}

export async function updateOrderByIdService(orderId, data) {
  return await OrderModel.findByIdAndUpdate(orderId, data, {
    new: true,
  });
}

export async function removeOrderByIdService(orderId) {
  return await OrderModel.findByIdAndDelete(orderId);
}

export async function countAllOrdersService(filters) {
  return OrderModel.countDocuments(filters);
}

export const calculateOrderTotalService = async (productVariantDetails, voucher) => {
  let subTotal = 0;
  let totalQuantity = 0;
  let shippingFee = 0;
  let discountVoucher = 0;
  let discount = 0;

  const orderDetails = productVariantDetails.map((variant) => {
    const totalPrice = variant.unitPrice * variant.quantity - discount;
    subTotal += totalPrice;
    totalQuantity += variant.quantity;
    return { ...variant, totalPrice, discount };
  });
  if (voucher && voucher.isFixed) {
    discountVoucher = voucher.discount;
  } else if (voucher) {
    discountVoucher = (subTotal * voucher.discount) / 100;
  }

  //fee
  const total = subTotal + shippingFee - discountVoucher;
  return { subTotal, total, totalQuantity, orderDetails };
};
