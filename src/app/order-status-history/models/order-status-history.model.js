import { ORDERS_STATUS } from '#src/core/constant';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ORDER_MODEL = 'order-status-history';

export const orderStatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(ORDERS_STATUS),
      required: true,
    },
    shippingCarrier: {
      type: String,
      default: null,
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    expectedShipDate: {
      type: Date,
      default: null,
    },

    // Foreign Key
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: ORDER_MODEL,
  },
);

const OrderStatusHistoryModel = mongoose.model('Order_Status_History', orderStatusHistorySchema);
export { OrderStatusHistoryModel };
