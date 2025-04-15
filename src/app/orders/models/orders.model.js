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
      enum: Object.values(ORDERS_STATUS),
    },
    payUrl: {
      type: String,
      default: null,
    },

    // Foreign Key
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    orderStatusHistory: [{
      type: Schema.Types.ObjectId,
      ref: 'Order_Status_History',
    }]
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: ORDER_MODEL,
  },
);

const OrderModel = mongoose.model('Order', orderSchema);
export { OrderModel };
