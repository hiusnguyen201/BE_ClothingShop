import mongoose from "mongoose";
import { GENDER } from "#src/constants";
const { Schema, Types } = mongoose;

const userSchema = new Schema(
  {
    avatar: {
      type: String,
      length: 300,
    },
    name: {
      type: String,
      required: true,
      length: 100,
      index: true,
    },
    phone: {
      type: String,
      length: 15,
    },
    birthday: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: [GENDER.MALE, GENDER.FEMALE, GENDER.OTHER],
      default: null,
    },
  },
  { versionKey: false, timestamps: true, _id: true, id: false }
);

const User = mongoose.model("User", userSchema);
export { User };
