import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_OPTIONS_MODEL = "product_options";

const productOptionSchema = new Schema(
  {
    // option_name: {
    //   type: String,
    //   required: true
    // },

    value: {
      type: Object,
      required: true
    },

    // FK
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    option: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Option'
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_OPTIONS_MODEL,
  }
);

const ProductOptionModel = mongoose.model("Product_Option", productOptionSchema);
export { ProductOptionModel };
