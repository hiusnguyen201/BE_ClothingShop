import mongoose from "mongoose";
const { Schema } = mongoose;

const RESET_PASSWORD_MODEL = "reset_passwords";

const resetPasswordSchema = new Schema(
  {
    token: {
      type: String,
      required: false,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: false,
      default: null,
    },

    // Foreign key
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: RESET_PASSWORD_MODEL,
  }
);

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);
export { ResetPassword };
