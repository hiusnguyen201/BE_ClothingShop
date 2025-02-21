import SoftDelete from '#core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
import { GENDER, USER_TYPES } from '#core/constant';
const { Schema } = mongoose;

const USER_MODEL = 'users';

const UserSchema = new Schema(
  {
    type: {
      type: String,
      length: 50,
      required: true,
      enum: [USER_TYPES.CUSTOMER, USER_TYPES.USER],
      default: USER_TYPES.CUSTOMER,
    },
    // Info
    avatar: {
      type: String,
      required: false,
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
      required: false,
      length: 15,
    },
    birthday: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      required: false,
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
      required: false,
      length: 100,
    },
    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    googleId: {
      type: String,
      required: false,
      default: null,
    },
    facebookId: {
      type: String,
      required: false,
      default: null,
    },

    // Foreign key
    role: { type: Schema.Types.ObjectId, ref: 'Role' },
    // permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],

    vouchers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Voucher' }],
      default: undefined,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: USER_MODEL,
  },
);

UserSchema.plugin(SoftDelete);
const UserModel = mongoose.model('User', UserSchema);
export { UserModel };
