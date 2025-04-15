import mongoose from 'mongoose';
const { Schema } = mongoose;

const ORDER_DETAIL_MODEL = 'order-details';

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
    isFixed: {
      type: Boolean,
      default: null,
    },
    discount: {
      type: Number,
      default: null,
    },

    // Foreign Key
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order', required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product', required: true
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'Product_Variant', required: true
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

const OrderDetailModel = mongoose.model('Order-detail', orderDetailSchema);
export { OrderDetailModel };
