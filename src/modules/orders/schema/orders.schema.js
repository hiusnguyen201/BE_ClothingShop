import { CURRENT_TIME, ORDERS_STATUS } from "#src/core/constant";
import mongoose from "mongoose";
const { Schema } = mongoose;

const ORDER_MODEL = "orders";

export const orderSchema = new Schema(
  {
    customer_name: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
      required: true,
    },
    customer_phone: {
      type: String,
      required: true,
    },
    shipping_address: {
      type: String,
      required: true,
    },
    order_date: {
      type: Date,
      required: true,
      default: CURRENT_TIME,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sub_total: {
      type: Number,
      required: true,
    },
    shipping_fee: {
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
        ref: "Payment",
        required: true,
        default: null,
      },
    ],
    customerId: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    voucherId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Voucher",
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
  }
);

const OrderModel = mongoose.model("Order", orderSchema);
export { OrderModel };
