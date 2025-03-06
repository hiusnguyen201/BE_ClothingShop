import mongoose from "mongoose";
const { Schema } = mongoose;

const ORDER_DETAIL_MODEL = "order-details";

export const orderDetailSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    is_fixed: {
      type: Boolean,
      required: true,
      default: false,
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    // Foreign Key
    // roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    orderId: [{ type: Schema.Types.ObjectId, ref: "Orders", required: true }],
    productId: [
      { type: Schema.Types.ObjectId, ref: "Products", required: true },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: ORDER_DETAIL_MODEL,
  }
);

const OrderDetailModel = mongoose.model("Order-details", orderDetailSchema);
export { OrderDetailModel };
