import mongoose from 'mongoose';
const { Schema } = mongoose;

const SHIPPING_ADDRESS_MODEL = 'shipping_addresses';

const shippingAddressSchema = new Schema(
  {
    customerName: {
      type: String,
      length: 255,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      length: 255,
      required: true,
    },
    province: {
      type: String,
      length: 50,
      required: true,
    },
    district: {
      type: String,
      length: 50,
      required: true,
    },
    ward: {
      type: String,
      length: 50,
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: true,
    },

    // Foreign key
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    versionKey: false,
    timestamps: true,
    id: false,
    _id: true,
    collection: SHIPPING_ADDRESS_MODEL,
  },
);

const ShippingAddressModel = mongoose.model('ShippingAddress', shippingAddressSchema);
export { ShippingAddressModel };
