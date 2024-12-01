import mongoose from "mongoose";
import { USER_IDENTIFY_STATUS } from "#src/constants";
import { Types } from "mongoose"
const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    // Primary Key
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

    // Foreign Key
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    role: { type: Schema.Types.ObjectId, ref: "Role" },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  },
  { versionKey: false, timestamps: true, _id: true, id: false }
);

const Account = mongoose.model("Account", accountSchema);
export { Account };
