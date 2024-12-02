import mongoose from "mongoose";
import { PERMISSION_STATUS, ALLOW_METHODS } from "#src/core/constant";
const { Schema } = mongoose;

const PERMISSION_MODEL = "permissions";

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      length: 50,
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
    status: {
      type: String,
      length: 50,
      required: true,
      enum: [
        PERMISSION_STATUS.ACTIVE,
        PERMISSION_STATUS.INACTIVE,
        PERMISSION_STATUS.DELETED,
      ],
    },

    // Foreign Key
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: PERMISSION_MODEL,
  }
);

const PermissionModel = mongoose.model("Permission", permissionSchema);
export { PermissionModel };
