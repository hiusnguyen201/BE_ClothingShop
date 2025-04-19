import { OrderDetailModel } from '#src/app/order-details/models/order-details.model';

/**
 * New order detail
 * @param {*} data
 * @returns
 */
export function newOrderDetailService(data) {
  return new OrderDetailModel(data);
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
 * Save order items
 * @param {*} data
 * @returns
 */
export const saveOrderItemsService = async (data, session) => {
  return await OrderDetailModel.insertMany(data, { session, ordered: true });
};

/**
 * Get list order detail
 * @param {*} order
 * @returns
 */
export const getListOrderDetailsByOrderIdService = async (orderId) => {
  return await OrderDetailModel.find({ order: orderId })
    .populate({
      path: 'variant',
      populate: {
        path: 'variantValues',
        populate: [
          { path: 'option', options: { lean: true }, select: '_id name' },
          { path: 'optionValue', options: { lean: true }, select: '_id valueName' },
        ],
      },
    })
    .populate({
      path: 'product',
    })
    .lean();
};

/**
 * Get order detail
 * @param {*} order
 * @returns
 */
export const getOrderDetailsByOrderIdService = async (order) => {
  return await OrderDetailModel.find({ order }).populate({
    path: 'variant',
    model: 'Product_Variant',
  });
};

/**
 * Delete order detail by orderId
 * @param {*} order
 * @param {*} session
 * @returns
 */
export const removeOrderDetailByOrderIdService = async (order, session) => {
  return await OrderDetailModel.deleteMany(
    {
      order,
    },
    {
      session,
    },
  );
};
