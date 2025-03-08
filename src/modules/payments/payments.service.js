import { PaymentModel } from "#src/modules/payments/schema/payments.schema";

export const createPaymentService = async (data) => {
  return await PaymentModel.create(data);
};

export const getPaymentByOrderIdService = async (orderId) => {
  return await PaymentModel.findOne({ orderId });
};
