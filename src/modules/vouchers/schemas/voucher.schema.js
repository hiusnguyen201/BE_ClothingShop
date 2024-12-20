import mongoose from "mongoose";
const { Schema } = mongoose;

const VOUCHER_MODEL = "vouchers";

const voucherSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      length: 15,
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
    maxUsesPerUser: {
      type: Number,
      required: true,
      default: 1,
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
      required: false,
    },
    hasMaxDiscount: {
      type: Boolean,
      required: true,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
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
