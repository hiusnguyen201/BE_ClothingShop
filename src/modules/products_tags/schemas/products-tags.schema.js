import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCTS_TAGS_MODEL = "products_tags";

const productsTagsSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCTS_TAGS_MODEL,
  }
);

const ProductTagModel = mongoose.model("Product_Tag", productsTagsSchema);
export { ProductTagModel };
