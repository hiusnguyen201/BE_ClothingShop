import SoftDelete from '#core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
import { ALLOW_METHODS } from '#core/constant';
const { Schema } = mongoose;

const PERMISSION_MODEL = 'permissions';

export const PermissionSchema = new Schema(
  {
    name: {
      type: String,
      length: 50,
      unique: true,
      required: true,
    },
    slug: {
      type: String,
      length: 100,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      length: 255,
    },
    module: {
      type: String,
      required: true,
      length: 50,
    },
    endpoint: {
      type: String,
      required: true,
      length: 255,
    },
    method: {
      type: String,
      length: 10,
      required: true,
      enum: ALLOW_METHODS,
    },
    isActive: {
      type: Boolean,
      default: false,
    },

    // Foreign Key
    // roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PERMISSION_MODEL,
  },
);

PermissionSchema.plugin(SoftDelete);
const PermissionModel = mongoose.model('Permission', PermissionSchema);
export { PermissionModel };
