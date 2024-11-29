import mongoose from "mongoose";
import { USER_IDENTIFY_STATUS } from "#src/constants";
const { Schema } = mongoose;

const userIdentifySchema = new Schema(
  {
    // Primary Key
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      length: 255,
      unique: true,
    },
    password: {
      type: String,
      length: 100,
    },
    status: {
      type: String,
      length: 50,
      required: true,
      enum: [
        USER_IDENTIFY_STATUS.ACTIVE,
        USER_IDENTIFY_STATUS.INACTIVE,
        USER_IDENTIFY_STATUS.DELETED,
        USER_IDENTIFY_STATUS.BANNED,
      ],
      default: USER_IDENTIFY_STATUS.INACTIVE,
    },
    activeCode: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true, _id: false, id: false }
);

const UserIdentify = mongoose.model("UserIdentify", userIdentifySchema);
export { UserIdentify };
