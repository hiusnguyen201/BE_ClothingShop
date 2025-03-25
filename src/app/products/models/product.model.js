import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_MODEL = "products";

const productSchema = new Schema(
  {
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
    short_description: {
      type: String,
      default: null
    },
    content: {
      type: String,
      default: null
    },
    avg_rating: {
      type: Number,
      default: 0,
    },
    total_review: {
      type: Number,
      default: 0,
    },
    removedAt: {
      type: Date,
    },

    // Foreign Key
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    sub_category: {
      type: Schema.Types.ObjectId,
      ref: "Category"
    },
    product_variants: [{
      type: Schema.Types.ObjectId,
      ref: "Product_Variant"
    }]
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_MODEL,
  }
);

const ProductModel = mongoose.model("Product", productSchema);
export { ProductModel };
