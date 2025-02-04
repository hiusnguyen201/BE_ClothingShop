import mongoose from "mongoose";
const { Schema } = mongoose;

const TAG_MODEL = "tags";

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },

    // products: [{
    //   type: Schema.Types.ObjectId,
    //   ref: "Product"
    // }]
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: TAG_MODEL,
  }
);

const TagModel = mongoose.model("Tag", tagSchema);
export { TagModel };
