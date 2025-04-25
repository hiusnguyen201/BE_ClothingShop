import SoftDelete from '#src/core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';

const { Schema } = mongoose;
import { ORDER_STATUS } from '#src/app/orders/orders.constant';

export const ORDER_MODEL = 'orders';

export const OrderSchema = new Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    orderDate: {
      type: Date,
      require: false,
      default: new Date(),
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

    trackingNumber: {
      type: String,
      default: null,
    },

    orderStatusHistory: {
      type: [
        {
          status: { type: String, required: true, enum: Object.values(ORDER_STATUS) },
          updatedAt: { type: Date, default: Date.now() },
        },
      ],
      default: [],
    },

    // Foreign Key
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    orderDetails: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order_Detail',
        default: [],
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

OrderSchema.plugin(SoftDelete);

const OrderModel = mongoose.model('Order', OrderSchema);
export { OrderModel };
