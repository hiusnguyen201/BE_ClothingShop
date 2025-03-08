import { PaymentModel } from '#src/app/v1/payments/schema/payments.schema';

export const createPaymentService = async (data) => {
  return await PaymentModel.create(data);
};
