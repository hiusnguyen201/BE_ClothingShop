import mongoose from 'mongoose';
const { Schema } = mongoose;

export const OPTIONS_MODEL = 'options';

const OptionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    // FK
    optionValues: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Option_Value',
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: OPTIONS_MODEL,
  },
);

const OptionModel = mongoose.model('Option', OptionSchema);
export { OptionModel };
