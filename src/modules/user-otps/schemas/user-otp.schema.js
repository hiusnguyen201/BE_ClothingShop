import mongoose from "mongoose";
const { Schema } = mongoose;

const userOtpSchema = new Schema(
  {
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
  { versionKey: false, timestamps: true, _id: true, id: false }
);

const UserOtp = mongoose.model("UserOtp", userOtpSchema);
export { UserOtp };
