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
 * Insert list payment
 * @param {object} data
 * @returns
 */
export async function insertPaymentService(data, session) {
  return await PaymentModel.bulkSave(data, { session, ordered: true });
}

/**
 * Create payment
 * @param {*} data
 * @returns
 */
export const createPaymentService = async (data, session) => {
  return await PaymentModel.insertOne(data, { session, ordered: true });
};

/**
 * Save payment
 * @param {*} data
 * @returns
 */
export const savePaymentService = async (payment, session) => {
  return await payment.save({ session, ordered: true });
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
    ordered: true,
  })
    .select(PAYMENT_SELECTED_FIELDS)
    .lean();
}
