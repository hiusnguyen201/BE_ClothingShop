import mongoose from "mongoose";
import { SUB_CATEGORY_STATUS } from "#src/core/constant";
const { Schema } = mongoose;

const SUB_CATEGORY_MODEL = "sub_categories";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      length: 120,
      index: true,
    },
    slug: {
      type: String,
      length: 150,
      required: true,
    },
    status: {
      type: String,
      length: 50,
      required: true,
      enum: [
        SUB_CATEGORY_STATUS.PUBLIC,
        SUB_CATEGORY_STATUS.HIDDEN,
        SUB_CATEGORY_STATUS.DELETED,
      ],
      default: SUB_CATEGORY_STATUS.HIDDEN,
    },

    // Foreign key
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: SUB_CATEGORY_MODEL,
  }
);

const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);
export { SubCategoryModel };
