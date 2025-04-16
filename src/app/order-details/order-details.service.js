import { OrderDetailModel } from '#src/app/order-details/models/order-details.model';

/**
 * New order detail
 * @param {*} data
 * @returns
 */
export function newOrderDetailService(data) {
  return new OrderDetailModel(data)
}

/**
 * Create order detail
 * @param {*} data
 * @returns
 */
export const createOrderDetailService = async (data) => {
  return await OrderDetailModel.create(data);
};

/**
 * Get order detail
 * @param {*} orderId
 * @returns
 */
export const getOrderDetailsByOrderIdService = async (orderId) => {
  return await OrderDetailModel.find({ orderId })
    .populate({
      path: 'variantId',
      model: 'Product_Variant',
    });
};

/**
 * Delete order detail by orderId
 * @param {*} orderId
 * @param {*} session
 * @returns
 */
export const removeOrderDetailByOrderIdService = async (orderId, session) => {
  return await OrderDetailModel.deleteMany({
    orderId
  }, {
    session
  });
};