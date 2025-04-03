import mongoose from "mongoose";
const { Schema } = mongoose;

export const OPTION_VALUES_MODEL = "optionValues";

const optionValueSchema = new Schema(
    {
        valueName: {
            type: String,
            required: true
        }
    },
    {
        versionKey: false,
        timestamps: true,
        _id: true,
        id: false,
        collection: OPTION_VALUES_MODEL,
    }
);

const OptionValueModel = mongoose.model("Option_Value", optionValueSchema);
export { OptionValueModel };
