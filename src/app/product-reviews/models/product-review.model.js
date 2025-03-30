import mongoose from "mongoose";
const { Schema } = mongoose;

const PRODUCT_REVIEW_MODEL = "product_reivews";

const productReviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product"
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PRODUCT_REVIEW_MODEL,
  }
);

const ProductReviewModel = mongoose.model("Product_Review", productReviewSchema);
export { ProductReviewModel };
