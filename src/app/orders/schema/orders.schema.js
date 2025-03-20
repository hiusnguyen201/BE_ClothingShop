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
    provinceName: {
      type: String,
      required: true,
    },
    districtName: {
      type: String,
      required: true,
    },
    wardName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
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
    shippingAddressId: { type: Schema.Types.ObjectId, ref: 'ShippingAddress', required: true },

    orderDate: {
      type: Date,
      required: true,
    },
    shippingDate: {
      type: Date,
      required: false,
      default: null,
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
    isPath: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: [ORDERS_STATUS.PENDING, ORDERS_STATUS.SHIPPING, ORDERS_STATUS.DELIVERED, ORDERS_STATUS.CANCELLED],
      default: ORDERS_STATUS.PENDING,
    },

    // Foreign Key
    // roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    voucherId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Voucher',
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
