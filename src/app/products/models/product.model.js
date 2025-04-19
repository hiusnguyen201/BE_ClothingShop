import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '#src/app/products/products.constant';
import SoftDelete from '#src/core/plugins/soft-delete.plugin';
const { Schema } = mongoose;

export const PRODUCT_MODEL = 'products';

const productSchema = new Schema(
  {
    thumbnail: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      length: 150,
    },
    slug: {
      type: String,
      required: true,
      length: 200,
    },
    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: PRODUCT_STATUS.INACTIVE,
      required: true,
    },

    // Foreign Key
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    productOptions: {
      type: [
        {
          option: { type: Schema.Types.ObjectId, ref: 'Option' },
          optionValues: [{ type: Schema.Types.ObjectId, ref: 'Option_Value' }],
        },
      ],
      default: [],
    },

    productVariants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product_Variant',
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_MODEL,
  },
);

productSchema.plugin(SoftDelete);

const ProductModel = mongoose.model('Product', productSchema);
export { ProductModel };
