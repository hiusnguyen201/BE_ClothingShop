import SoftDelete from '#src/core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
const { Schema } = mongoose;

export const PERMISSION_MODEL = 'permissions';

export const PermissionSchema = new Schema(
  {
    name: {
      type: String,
      length: 50,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
      length: 255,
    },
    module: {
      type: String,
      required: true,
      length: 50,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    id: false,
    _id: true,
    collection: PERMISSION_MODEL,
  },
);

PermissionSchema.plugin(SoftDelete);

const PermissionModel = mongoose.model('Permission', PermissionSchema);
export { PermissionModel };
