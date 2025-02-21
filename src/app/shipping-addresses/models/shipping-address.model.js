import mongoose from "mongoose";
const { Schema } = mongoose;

const SHIPPING_ADDRESS_MODEL = "shipping_addresses";

const shippingAddressSchema = new Schema(
  {
    address: {
      type: String,
      length: 255,
      required: true,
    },
    street: {
      type: String,
      length: 50,
      required: true,
    },
    city: {
      type: String,
      length: 50,
      required: true,
    },
    ward: {
      type: String,
      length: 50,
      required: true,
    },
    district: {
      type: String,
      length: 50,
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: true,
    },

    // Foreign key
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: SHIPPING_ADDRESS_MODEL,
  }
);

const ShippingAddressModel = mongoose.model(
  "ShippingAddress",
  shippingAddressSchema
);
export { ShippingAddressModel };
