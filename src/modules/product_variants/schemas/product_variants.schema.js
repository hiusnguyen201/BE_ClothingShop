import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_VARIANTS_MODEL = "product_variants";

const productVariantsSchema = new Schema(
  {
    available: {
      type: Boolean,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    option1: {
      type: String,
      required: true,
    },
    option2: {
      type: String,
    },
    sold: {
      type: Number,
      default: 0,
    },

    // Foreign Key
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_VARIANTS_MODEL,
  }
);

const ProductVariantModel = mongoose.model("ProductVariant", productVariantsSchema);
export { ProductVariantModel };
