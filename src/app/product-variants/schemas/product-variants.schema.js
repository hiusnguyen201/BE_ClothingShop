import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_VARIANT_MODEL = "product_variants";

const productVariantSchema = new Schema(
  {
    quantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    sold: {
      type: Number,
      default: 0,
    },

    // Foreign Key
    // product: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Product",
    //   required: true,
    // },
    variant_values: [{
      option: {
        type: Schema.Types.ObjectId,
        ref: "Option"
      },
      option_value: {
        type: Schema.Types.ObjectId,
        ref: "Option_Value"
      }
    }]
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_VARIANT_MODEL,
  }
);

const ProductVariantModel = mongoose.model("Product_Variant", productVariantSchema);
export { ProductVariantModel };
