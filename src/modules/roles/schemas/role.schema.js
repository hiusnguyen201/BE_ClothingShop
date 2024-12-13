import mongoose from "mongoose";
import { ROLE_STATUS } from "#src/core/constant";
const { Schema } = mongoose;

const ROLE_MODEL = "roles";

const roleSchema = new Schema(
  {
    icon: {
      type: String,
      length: 300,
    },
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
    status: {
      type: String,
      length: 50,
      required: true,
      enum: [ROLE_STATUS.ACTIVE, ROLE_STATUS.INACTIVE, ROLE_STATUS.BANNED],
    },

    // Foreign Key
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: ROLE_MODEL,
  }
);

const RoleModel = mongoose.model("Role", roleSchema);
export { RoleModel };
