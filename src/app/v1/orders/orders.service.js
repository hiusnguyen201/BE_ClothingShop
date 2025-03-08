import { OrderModel } from '#src/app/v1/orders/schema/orders.schema';

export async function createOrderService(data) {
  return await OrderModel.create(data);
}
export async function getAllOrdersByUserService(userId) {
  const orders = await OrderModel.find({
    users: userId,
  });
  return orders;
}
export async function getOrderByIdService(orderId) {
  const order = await OrderModel.findOne({
    _id: orderId,
  });
  return order;
}

export async function updateOrderByIdService({ orderId, ...data }) {
  return await OrderModel.findByIdAndUpdate(orderId, data, {
    new: true,
  });
}

export async function removeOrderByIdService(orderId) {
  return await OrderModel.findByIdAndDelete(orderId);
}
