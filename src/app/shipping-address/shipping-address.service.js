import { ShippingAddressModel } from '#src/models/shipping-address.model';

export const createShippingAddressService = async (data) => {
  return await ShippingAddressModel.create(data);
};

export const getShippingAddressByIdService = async ({ shippingAddressId }) => {
  const address = await ShippingAddressModel.findOne({ shippingAddressId }).populate({
    path: 'customerId',
    model: 'User',
    select: '-password',
  });
  return address;
};

export const getShippingAddressByUserIdService = async ({ userId }) => {
  const address = await ShippingAddressModel.findOne({ userId, isDefault: true }).populate({
    path: 'customerId',
    model: 'User',
    select: '-password',
  });
  return address;
};

export async function updateShippingAddressByIdService(shippingAddressId, data) {
  return await ShippingAddressModel.findByIdAndUpdate(shippingAddressId, data, {
    new: true,
  });
}
