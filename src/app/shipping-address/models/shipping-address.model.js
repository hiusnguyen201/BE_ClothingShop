import mongoose from 'mongoose';
const { Schema } = mongoose;

export const SHIPPING_ADDRESS_MODEL = 'shipping_address';

const shippingAddressSchema = new Schema(
  {
    address: {
      type: String,
      length: 255,
      required: true,
    },
    provinceName: {
      type: String,
      length: 50,
      required: true,
    },
    districtName: {
      type: String,
      length: 50,
      required: true,
    },
    wardName: {
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
      ref: 'User',
    },
  },
  {
    versionKey: false,
    timestamps: true,
    _id: true,
    id: false,
    collection: SHIPPING_ADDRESS_MODEL,
  },
);

const ShippingAddressModel = mongoose.model('Shipping_Address', shippingAddressSchema);
export { ShippingAddressModel };
