import { ORDERS_STATUS } from '#src/core/constant';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ORDER_MODEL = 'orders';

export const orderSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      length: 14,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        ORDERS_STATUS.PENDING,
        ORDERS_STATUS.PAID,
        ORDERS_STATUS.SHIPPED,
        ORDERS_STATUS.DELIVERED,
        ORDERS_STATUS.CANCELLED,
      ],
      default: ORDERS_STATUS.PENDING,
    },

    // Foreign Key
    // roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    paymentId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
        default: null,
      },
    ],
    customerId: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    voucherId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Voucher',
        required: true,
        default: null,
      },
    ],
    employeeId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        default: null,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: ORDER_MODEL,
  },
);

const OrderModel = mongoose.model('Orders', orderSchema);
export { OrderModel };
