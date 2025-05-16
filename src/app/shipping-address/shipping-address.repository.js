import { isValidObjectId } from 'mongoose';
import { ShippingAddressModel } from '#src/app/shipping-address/models/shipping-address.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { SHIPPING_ADDRESS_SELECTED_FIELDS } from '#src/app/shipping-address/shipping-address.constant';

/**
 * Create shipping address
 * @param {*} data
 * @returns
 */
export async function createShippingAddressRepository(data) {
  return ShippingAddressModel.create(data);
}

/**
 * Get and count shipping address
 * @param {*} query
 * @returns
 */
export async function getAndCountShippingAddressRepository(filters, skip, limit, sortBy, sortOrder) {
  const totalCount = await ShippingAddressModel.countDocuments(filters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await ShippingAddressModel.find(filters, SHIPPING_ADDRESS_SELECTED_FIELDS, queryOptions).lean();

  return [totalCount, list];
}

/**
 * Count all shipping addresses
 * @param {*} filters
 * @returns
 */
export async function countAllShippingAddressRepository(filters) {
  return ShippingAddressModel.countDocuments(filters);
}

/**
 * Get one address by id
 * @param {*} addressId
 * @returns
 */
export async function getShippingAddressByIdRepository(addressId, extras = {}) {
  if (!addressId) return null;

  const filters = {
    ...extras,
  };

  if (isValidObjectId(addressId)) {
    filters._id = addressId;
  } else {
    return null;
  }

  return ShippingAddressModel.findOne(filters).select(SHIPPING_ADDRESS_SELECTED_FIELDS).lean();
}

/**
 * Update shipping address by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateShippingAddressByIdRepository(id, data) {
  return ShippingAddressModel.findByIdAndUpdate(id, data, {
    new: true,
  })
    .select(SHIPPING_ADDRESS_SELECTED_FIELDS)
    .lean();
}

/**
 * Remove shipping address by id
 * @param {*} id
 * @returns
 */
export async function removeShippingAddressByIdRepository(id) {
  return ShippingAddressModel.findByIdAndDelete(id).select(SHIPPING_ADDRESS_SELECTED_FIELDS).lean();
}

/**
 * Set default shipping address by id
 * @param {*} addressId
 * @param {*} customerId
 * @returns
 */
export async function setDefaultShippingAddressByIdRepository(addressId, customerId) {
  return ShippingAddressModel.updateOne(
    {
      _id: addressId,
      customer: customerId,
    },
    {
      isDefault: true,
    },
    {
      new: true,
    },
  )
    .select(SHIPPING_ADDRESS_SELECTED_FIELDS)
    .lean();
}

/**
 * Unset default current shipping address
 * @param {*} customerId
 * @returns
 */
export async function unsetDefaultCurrentShippingAddressRepository(customerId) {
  return ShippingAddressModel.updateOne(
    {
      customer: customerId,
      isDefault: true,
    },
    {
      $set: { isDefault: false },
    },
    {
      new: true,
    },
  )
    .select(SHIPPING_ADDRESS_SELECTED_FIELDS)
    .lean();
}
