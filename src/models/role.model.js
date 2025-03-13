import SoftDelete from '#core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
const { Schema } = mongoose;

export const ROLE_MODEL = 'roles';

const RoleSchema = new Schema(
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
      required: false,
      length: 255,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: false,
    },

    // Foreign Key
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  },
  {
    versionKey: false,
    timestamps: true,
    id: false,
    _id: true,
    collection: ROLE_MODEL,
  },
);

RoleSchema.plugin(SoftDelete);

const RoleModel = mongoose.model('Role', RoleSchema);
export { RoleModel };
