import mongoose from "mongoose";
const { Schema } = mongoose;

const OPTION_MODEL = "options";

const optionSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
    },
    {
        versionKey: false,
        timestamps: true,
        _id: true,
        id: false,
        collection: OPTION_MODEL,
    }
);

const OptionModel = mongoose.model("Option", optionSchema);
export { OptionModel };
