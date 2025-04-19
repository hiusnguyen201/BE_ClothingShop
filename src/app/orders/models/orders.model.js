import SoftDelete from '#src/core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
const { Schema } = mongoose;
import mongooseSequence from 'mongoose-sequence';
const AutoIncrement = mongooseSequence(mongoose);

export const ORDER_MODEL = 'orders';

export const OrderSchema = new Schema(
  {
    code: {
      type: Number,
      unique: true,
    },
    orderDate: {
      type: Date,
      require: true,
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

    notes: {
      type: String,
      require: false,
    },

    // Foreign Key
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    orderStatusHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order_Status_History',
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

OrderSchema.plugin(AutoIncrement, { inc_field: 'code' });
OrderSchema.plugin(SoftDelete);

const OrderModel = mongoose.model('Order', OrderSchema);
export { OrderModel };
