import { PaymentModel } from '#src/app/payments/models/payments.model';
import { PAYMENT_SELECTED_FIELDS } from '#src/app/payments/payments.constant';

/**
 * New payment
 * @param {*} data
 * @returns
 */
export const newPaymentService = (data) => {
  return new PaymentModel(data);
};

/**
 * Save payment
 * @param {*} data
 * @returns
 */
export const savePaymentService = async (payment, session) => {
  return await payment.save({ session });
};

/**
 * Get payment by id
 * @param {*} data
 * @returns
 */
export const getPaymentByIdService = async (paymentId) => {
  return await PaymentModel.findById(paymentId);
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
    session,
  })
    .select(PAYMENT_SELECTED_FIELDS)
    .lean();
}
