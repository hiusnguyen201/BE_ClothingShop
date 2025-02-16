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
    price: {
      type: Number,
      required: true,
    },
    short_description: {
      type: String,
      length: 255,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    is_hidden: {
      type: Boolean,
      default: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_new: {
      type: Boolean,
      default: false,
    },
    avg_rating: {
      type: Number,
      default: 0,
    },
    total_review: {
      type: Number,
      default: 0,
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
    product_discount: {
      type: Schema.Types.ObjectId,
      ref: "Product_Discount"
    },

    tags: [{
      type: Schema.Types.ObjectId,
      ref: "Tag"
    }],
    product_options: [{
      type: Schema.Types.ObjectId,
      ref: "Product_Option"
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
