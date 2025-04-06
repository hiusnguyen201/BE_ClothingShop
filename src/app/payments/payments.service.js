import { PaymentModel } from '#src/app/payments/models/payments.models';

const SELECTED_FIELDS =
  "_id paymentMethod amountPaid paidDate transactionId notes orderId createdAt updatedAt";

export const newPaymentService = (data) => {
  return new PaymentModel(data);
};

export const getPaymentByOrderIdService = async (orderId) => {
  return await PaymentModel.findOne({ orderId });
};

/**
 * Update payment by paymentId
 * @param {*} paymentId
 * @param {*} data
 * @returns
 */
export async function updatePaymentByIdService(paymentId, data, session) {
  return await PaymentModel.findByIdAndUpdate(paymentId, data, {
    new: true,
    session
  }).select(SELECTED_FIELDS);
}
