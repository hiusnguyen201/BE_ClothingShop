import { PAYMENT_METHOD } from '#src/core/constant';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PAYMENT_MODEL = 'payments';

export const paymentSchema = new Schema(
  {
    paymentMethod: {
      type: String,
      required: true,
      enum: [PAYMENT_METHOD.COD, PAYMENT_METHOD.VNPAY, PAYMENT_METHOD.MOMO],
      default: PAYMENT_METHOD.COD,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    paidDate: {
      type: Date,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
    // Foreign Key
    orderId: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
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
