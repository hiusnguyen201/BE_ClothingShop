import mongoose from 'mongoose';
const { Schema } = mongoose;

const PRODUCT_VARIANT_MODEL = 'productVariants';

export const productVariantSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_VARIANT_MODEL,
  },
);

const ProductVariantModel = mongoose.model('productVariant', productVariantSchema);
export { ProductVariantModel };
