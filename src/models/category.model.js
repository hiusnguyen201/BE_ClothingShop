import MongooseDelete from 'mongoose-delete';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const CATEGORY_MODEL = 'categories';

const CategorySchema = new Schema(
  {
    image: {
      type: String,
      length: 300,
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
    },
    isHide: {
      type: Boolean,
      default: true,
    },
    level: {
      type: Number,
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

CategorySchema.plugin(MongooseDelete, { deletedAt: true });
const CategoryModel = mongoose.model('Category', CategorySchema);
export { CategoryModel };
