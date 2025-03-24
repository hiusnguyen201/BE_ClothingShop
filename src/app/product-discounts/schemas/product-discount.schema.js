import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_DISCOUNTS_MODEL = "product_discounts";

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
    is_fixed: {
      type: Boolean,
      required: true
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    removedAt: {
      type: Date,
      required: true
    },

    // FK
    product_variant: {
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
