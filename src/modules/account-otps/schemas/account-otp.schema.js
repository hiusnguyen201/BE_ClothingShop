import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const accountOtpSchema = new Schema(
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
    account: { type: Schema.Types.ObjectId, ref: "Account" },
  },
  { versionKey: false, timestamps: true, _id: false, id: false }
);

const AccountOtp = mongoose.model("AccountOtp", accountOtpSchema);
export { AccountOtp };
