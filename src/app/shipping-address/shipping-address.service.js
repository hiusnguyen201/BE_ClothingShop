import { ShippingAddressModel } from '#src/app/shipping-address/model/shipping-address.model';

export const createShippingAddressService = async (data) => {
  return await ShippingAddressModel.create(data);
};

export const getShippingAddressByIdService = async (shippingAddressId) => {
  return await ShippingAddressModel.findOne({ _id: shippingAddressId }).populate({
    path: 'customerId',
    model: 'User',
    select: '-password',
  });
};

export const getShippingAddressByUserIdService = async (userId) => {
  return await ShippingAddressModel.findOne({ _id: userId, isDefault: true }).populate({
    path: 'customerId',
    model: 'User',
    select: '-password',
  });
};

export async function updateShippingAddressByIdService(shippingAddressId, data) {
  return await ShippingAddressModel.findByIdAndUpdate(shippingAddressId, data, {
    new: true,
  });
}
