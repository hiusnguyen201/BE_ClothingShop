import SoftDelete from '#src/core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const CATEGORY_MODEL = 'categories';

const CategorySchema = new Schema(
  {
    image: {
      type: String,
      required: false,
      length: 300,
      default: null,
    },
    name: {
      type: String,
      required: true,
      length: 120,
      unique: true,
    },
    slug: {
      type: String,
      length: 150,
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      required: false,
      default: 1,
    },

    // Foreign key
    parent: { type: Schema.Types.ObjectId, ref: 'Category' },
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
