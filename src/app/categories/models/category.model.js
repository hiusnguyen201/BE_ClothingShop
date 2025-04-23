import SoftDelete from '#src/core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
const { Schema } = mongoose;

export const CATEGORY_MODEL = 'categories';

const CategorySchema = new Schema(
  {
    image: {
      type: String,
      required: true,
      length: 300,
    },
    name: {
      type: String,
      required: true,
      length: 100,
      unique: true,
    },
    slug: {
      type: String,
      length: 200,
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      required: false,
      default: 1,
    },

    // Foreign key
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  {
    versionKey: false,
    timestamps: true,
    id: false,
    _id: true,
    collection: CATEGORY_MODEL,
  },
);

CategorySchema.plugin(SoftDelete);

const CategoryModel = mongoose.model('Category', CategorySchema);
export { CategoryModel };
