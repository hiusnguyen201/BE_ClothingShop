import { OrderDetailModel } from '#src/app/v1/orderDetails/schema/order-details.schema';

export const createOrderDetailService = async (data) => {
  return await OrderDetailModel.create(data);
};
