import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_DISCOUNTS_MODEL = "productDiscounts";

const productDiscountSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    isFixed: {
      type: Boolean,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    removedAt: {
      type: Date,
      default: null
    },

    // FK
    productVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_Variant'
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_DISCOUNTS_MODEL,
  }
);

const ProductDiscountModel = mongoose.model("Product_Discount", productDiscountSchema);
export { ProductDiscountModel };
