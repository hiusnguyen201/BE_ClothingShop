import { OrderModel } from '#src/app/orders/schema/orders.schema';

export async function createOrderService(data, session) {
  if (session) {
    const result = await OrderModel.create([data], { session });
    return result[0];
  }
  return await OrderModel.create(data);
}
export async function getAllOrdersByUserService({ filters, offset = 0, limit = 10, sortOptions }) {
  return await OrderModel.find(filters).skip(offset).limit(limit).sort(sortOptions).lean();
}

export async function getOrderByIdService(orderId) {
  return await OrderModel.findOne({
    _id: orderId,
  }).populate('paymentId');
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
  let discountProduct = 0;

  const orderDetails = productVariantDetails.map((variant) => {
    const totalPrice = variant.unitPrice * variant.quantity - discountProduct;
    subTotal += totalPrice;
    totalQuantity += variant.quantity;
    return { ...variant, totalPrice, discountProduct };
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
