import mongoose from "mongoose";
import { GENDER, USER_IDENTIFY_STATUS } from "#src/constants";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // Info
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

    // Account
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

    // Foreign key
    role: { type: Schema.Types.ObjectId, ref: "Role" },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  },
  { versionKey: false, timestamps: true, _id: true, id: false }
);

const User = mongoose.model("User", userSchema);
export { User };
