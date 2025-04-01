import mongoose from 'mongoose';
import { USER_TYPE, GENDER } from '#src/app/users/users.constant';
import SoftDelete from '#src/core/plugins/soft-delete.plugin';
const { Schema } = mongoose;

export const USER_MODEL = 'users';

const UserSchema = new Schema(
  {
    type: {
      type: String,
      length: 50,
      required: true,
      enum: USER_TYPE,
      default: USER_TYPE.CUSTOMER,
    },
    avatar: {
      type: String,
      required: false,
      length: 300,
      default: null,
    },
    name: {
      type: String,
      required: true,
      length: 100,
      index: true,
    },
    email: {
      type: String,
      required: true,
      length: 255,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      length: 15,
    },
    password: {
      type: String,
      required: false,
      length: 100,
    },
    gender: {
      type: String,
      required: false,
      enum: Object.values(GENDER),
      default: null,
    },
    googleId: {
      type: String,
      required: false,
      default: null,
    },
    refreshToken: {
      type: String,
      required: false,
      default: null,
    },

    verifiedAt: {
      type: Date,
      required: false,
      default: null,
    },
    untilLockedAt: {
      type: Date,
      required: false,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      required: false,
      default: null,
    },

    // Foreign key
    role: { type: Schema.Types.ObjectId, ref: 'Role', default: null },

    vouchers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Voucher' }],
      default: [],
    },
  },
  {
    collection: USER_MODEL,
    versionKey: false,
    timestamps: true,
  },
);

UserSchema.plugin(SoftDelete);

const UserModel = mongoose.model('User', UserSchema);
export { UserModel };
