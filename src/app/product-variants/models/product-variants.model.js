import mongoose from 'mongoose';
const { Schema } = mongoose;

export const PRODUCT_VARIANT_MODEL = 'product_variants';

const productVariantSchema = new Schema(
  {
    image: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      default: null,
    },
    sold: {
      type: Number,
      default: 0,
    },

    // Foreign Key
    variantValues: [
      {
        option: {
          type: Schema.Types.ObjectId,
          ref: 'Option',
        },
        optionValue: {
          type: Schema.Types.ObjectId,
          ref: 'Option_Value',
        },
      },
    ],

    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
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

const ProductVariantModel = mongoose.model('Product_Variant', productVariantSchema);
export { ProductVariantModel };
