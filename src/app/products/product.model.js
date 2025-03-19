import mongoose from 'mongoose';
const { Schema } = mongoose;

const PRODUCT_MODEL = 'products';

export const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
    },
  },

  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_MODEL,
  },
);

const ProductModel = mongoose.model('Product', productSchema);
export { ProductModel };
