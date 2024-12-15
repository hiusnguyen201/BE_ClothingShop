import mongoose from "mongoose";
const { Schema } = mongoose;

const VOUCHER_MODEL = "vouchers";

const voucherSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      length: 50,
    },
    name: {
      type: String,
      required: true,
      length: 150,
    },
    description: {
      type: String,
      required: false,
    },
    maxUses: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    isFixed: {
      type: Boolean,
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: true,
    },
    maxDiscount: {
      type: Number,
      require: true,
    },
    minPrice: {
      type: Number,
      require: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Calculate
    uses: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: VOUCHER_MODEL,
  }
);

const VoucherModel = mongoose.model("Voucher", voucherSchema);
export { VoucherModel };
