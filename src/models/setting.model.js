import SoftDelete from '#src/core/plugins/soft-delete.plugin';
import mongoose from 'mongoose';
const { Schema } = mongoose;

export const SETTING_MODEL = 'settings';

const SettingSchema = new Schema(
  {
    group: {
      type: String,
      length: 200,
      required: true,
    },
    key: {
      type: String,
      length: 100,
      required: true,
    },
    value: {
      type: String,
      required: false,
      length: 255,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    id: false,
    _id: true,
    collection: SETTING_MODEL,
  },
);

SettingSchema.plugin(SoftDelete);

const SettingModel = mongoose.model('Setting', SettingSchema);
export { SettingModel };
