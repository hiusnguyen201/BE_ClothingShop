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
    shortDescription: {
      type: String,
      default: null
    },
    content: {
      type: String,
      default: null
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
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category"
    },
    productVariants: [{
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
