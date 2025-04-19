import mongoose from 'mongoose';
const { Schema } = mongoose;

export const ORDER_DETAIL_MODEL = 'order_details';

export const orderDetailSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },

    // Foreign Key
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: 'Product_Variant',
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: ORDER_DETAIL_MODEL,
  },
);

const OrderDetailModel = mongoose.model('Order_Detail', orderDetailSchema);
export { OrderDetailModel };
