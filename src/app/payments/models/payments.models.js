import { PAYMENT_METHOD } from '#src/core/constant';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PAYMENT_MODEL = 'payments';

export const paymentSchema = new Schema(
  {
    paymentMethod: {
      type: String,
      required: true,
      enum: [PAYMENT_METHOD.COD, PAYMENT_METHOD.VNPAY, PAYMENT_METHOD.MOMO],
    },
    amountPaid: {
      type: Number,
      default: null
    },
    paidDate: {
      type: Date,
      default: null
    },
    transactionId: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: null
    },
    // Foreign Key
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
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
