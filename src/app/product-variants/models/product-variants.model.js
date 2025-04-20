import mongoose from 'mongoose';
const { Schema } = mongoose;

export const PRODUCT_VARIANT_MODEL = 'productVariants';

const productVariantSchema = new Schema(
  {
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
    image: {
      type: String,
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
    productDiscount: {
      type: Schema.Types.ObjectId,
      ref: 'Product_Discount',
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
