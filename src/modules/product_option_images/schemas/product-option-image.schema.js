import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_OPTION_IMAGES_MODEL = "product_option_images";

const productOptionImageSchema = new Schema(
  {
    image: {
      type: String,
      required: true
    },

    // FK
    product_option: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_Option'
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_OPTION_IMAGES_MODEL,
  }
);

const ProductOptionImageModel = mongoose.model("Product_Option_Image", productOptionImageSchema);
export { ProductOptionImageModel };
