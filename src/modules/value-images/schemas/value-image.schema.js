import mongoose from "mongoose";
const { Schema } = mongoose;

const VALUE_IMAGES_MODEL = "value_images";

const valueImageSchema = new Schema(
  {
    image: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: VALUE_IMAGES_MODEL,
  }
);

const ValueImageModel = mongoose.model("Value_Image", valueImageSchema);
export { ValueImageModel };
