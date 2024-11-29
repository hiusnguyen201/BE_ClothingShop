import mongoose from "mongoose";
import { PERMISSION_STATUS, ALLOWED_METHOD } from "#src/constants";
const { Schema, Types } = mongoose;

const permissionSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      default: new Types.ObjectId(),
    },
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
      enum: ALLOWED_METHOD,
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
  { versionKey: false, timestamps: true, _id: false, id: false }
);

const Permission = mongoose.model("Permission", permissionSchema);
export { Permission };
