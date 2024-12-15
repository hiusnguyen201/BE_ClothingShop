import mongoose from "mongoose";
const { Schema } = mongoose;

const CATEGORY_MODEL = "categories";

const categorySchema = new Schema(
  {
    icon: {
      type: String,
      length: 300,
    },
    name: {
      type: String,
      required: true,
      length: 120,
      index: true,
      unique: true,
    },
    slug: {
      type: String,
      length: 150,
      required: true,
    },
    isHide: {
      type: Boolean,
      default: true,
    },

    // Foreign key
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
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
