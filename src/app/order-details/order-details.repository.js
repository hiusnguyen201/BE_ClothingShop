import { OrderDetailModel } from '#src/app/order-details/models/order-details.model';

/**
 * New order detail
 * @param {*} data
 * @returns
 */
export function newOrderDetailRepository(data) {
  return new OrderDetailModel(data);
}

/**
 * Insert list order details
 * @param {object} data
 * @returns
 */
export async function insertOrderDetailsRepository(data, session) {
  return await OrderDetailModel.bulkSave(data, { session, ordered: true });
}

/**
 * Create order detail
 * @param {*} data
 * @returns
 */
export const createOrderDetailRepository = async (data) => {
  return await OrderDetailModel.create(data);
};

/**
 * Save order items
 * @param {*} data
 * @returns
 */
export const saveOrderItemsRepository = async (data, session) => {
  return await OrderDetailModel.insertMany(data, { session, ordered: true });
};

/**
 * Get list order detail
 * @param {*} order
 * @returns
 */
export const getListOrderDetailsByOrderIdRepository = async (orderId) => {
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
export const getOrderDetailsByOrderIdRepository = async (orderId) => {
  return await OrderDetailModel.find({ order: orderId }).populate({
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
export const removeOrderDetailByOrderIdRepository = async (orderId, session) => {
  return await OrderDetailModel.deleteMany(
    {
      order: orderId,
    },
    {
      session,
    },
  );
};
