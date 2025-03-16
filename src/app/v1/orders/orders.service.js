import { OrderModel } from '#src/app/v1/orders/schema/orders.schema';

export async function createOrderService(data, session) {
  return await OrderModel.create(data, { session });
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
