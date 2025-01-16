import mongoose from "mongoose";
const { Schema } = mongoose;

const LOGIN_ATTEMPT_MODULE = "login_attempts";

const loginAttemptSchema = new Schema(
  {
    // Foreign Key
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: LOGIN_ATTEMPT_MODULE,
  }
);
const LoginAttemptModule = mongoose.model("LoginAttemp", loginAttemptSchema);

export { LoginAttemptModule };
