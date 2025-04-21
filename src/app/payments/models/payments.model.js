import { ONLINE_PAYMENT_METHOD, PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import mongoose from 'mongoose';
const { Schema } = mongoose;

export const PAYMENT_MODEL = 'payments';

export const paymentSchema = new Schema(
  {
    paymentUrl: {
      type: String,
      default: null,
    },
    qrCodeUrl: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: Object.values(ONLINE_PAYMENT_METHOD),
    },
    amountPaid: {
      type: Number,
      default: null,
    },
    paidDate: {
      type: Date,
      default: null,
    },
    transactionId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_STATUS),
    },
    // Foreign Key
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PAYMENT_MODEL,
  },
);

const PaymentModel = mongoose.model('Payment', paymentSchema);
export { PaymentModel };
