import mongoose from "mongoose";
import { CATEGORY_STATUS } from "#src/core/constant";
const { Schema } = mongoose;

const CATEGORY_MODEL = "categories";

const categorySchema = new Schema(
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
        CATEGORY_STATUS.PUBLIC,
        CATEGORY_STATUS.HIDDEN,
        CATEGORY_STATUS.DELETED,
      ],
      default: CATEGORY_STATUS.HIDDEN,
    },

    // Foreign key
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: CATEGORY_MODEL,
  }
);

const CategoryModel = mongoose.model("Category", categorySchema);
export { CategoryModel };
