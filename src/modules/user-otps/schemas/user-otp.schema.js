import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const userOtpSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      default: new Types.ObjectId(),
    },
    otp: {
      type: String,
      required: true,
      length: 6,
    },
    expireDate: {
      type: Date,
      required: true,
    },

    // Foreign Key
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false, timestamps: true, _id: false, id: false }
);

const UserOtp = mongoose.model("UserOtp", userOtpSchema);
export { UserOtp };
