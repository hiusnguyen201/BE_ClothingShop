import { OrderDetailModel } from '#src/app/orderDetails/models/order-details.model';

/**
 * New order detail
 * @param {*} data
 * @returns
 */
export function newOrderDetailService(data) {
  return new OrderDetailModel(data)
}


export const createOrderDetailService = async (data) => {
  return await OrderDetailModel.create(data);
};

export const getOrderDetailsByOrderIdService = async (orderId) => {
  return await OrderDetailModel.find({ orderId }).populate({
    path: 'variantId',
    model: 'ProductVariant',
  });
};
