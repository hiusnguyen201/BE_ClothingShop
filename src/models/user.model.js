import mongoose from 'mongoose';
import { genSalt, hash, compare } from 'bcrypt';
import { UserConstant } from '#app/v2/users/UserConstant';
import SoftDelete from '#core/plugins/soft-delete.plugin';
const { Schema } = mongoose;

const USER_MODEL = 'users';

const UserSchema = new Schema(
  {
    type: {
      type: String,
      length: 50,
      required: true,
      enum: Object.values(UserConstant.USER_TYPES),
      default: UserConstant.USER_TYPES.CUSTOMER,
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
      enum: Object.values(UserConstant.GENDER),
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
    collection: USER_MODEL,
    _id: true,
    id: false,
  },
);

UserSchema.plugin(SoftDelete);

UserSchema.methods.hashPassword = async function (password) {
  const salt = await genSalt();
  return hash(password, salt);
};

UserSchema.methods.comparePassword = async function (password, hash) {
  return compare(password, hash);
};

const UserModel = mongoose.model('User', UserSchema);
export { UserModel };
