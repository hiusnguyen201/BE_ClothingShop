import mongoose from "mongoose";
const { Schema } = mongoose;

const OPTION_VALUES_MODEL = "option_values";

const optionValueSchema = new Schema(
    {
        value: {
            type: String,
            required: true
        },

        images: [{
            type: String,
        }]
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
