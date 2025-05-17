import mongoose from 'mongoose';
const { Schema } = mongoose;

export const USER_OTP_MODEL = 'user_otps';

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
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
    id: false,
    _id: true,
    collection: USER_OTP_MODEL,
  },
);

const UserOtpModel = mongoose.model('UserOtp', userOtpSchema);
export { UserOtpModel };
