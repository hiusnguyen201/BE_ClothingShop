import {
  createShippingAddressRepository,
  getShippingAddressByIdRepository,
  updateShippingAddressByIdRepository,
  removeShippingAddressByIdRepository,
  setDefaultShippingAddressByIdRepository,
  unsetDefaultCurrentShippingAddressRepository,
  countAllShippingAddressRepository,
  getAndCountShippingAddressRepository,
} from '#src/app/shipping-address/shipping-address.repository';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';
import { getDistrictService, getProvinceService, getWardService } from '#src/modules/GHN/ghn.service';
import {
  deleteShippingAddressFromCache,
  getShippingAddressFromCache,
  getListShippingAddressFromCache,
  setShippingAddressToCache,
  setListShippingAddressToCache,
} from '#src/app/shipping-address/shipping-address.cache';
import { Assert } from '#src/core/assert/Assert';

/**
 * @typedef {import("#src/app/shipping-address/models/shipping-address.model").ShippingAddressModel} ShippingAddressModel
 * @typedef {import("#src/app/shipping-address/dtos/create-shipping-address.dto").CreateShippingAddressDto} CreateShippingAddressPort
 * @typedef {import("#src/app/shipping-address/dtos/get-list-shipping-address.dto").GetListShippingAddressDto} GetListShippingAddressPort
 * @typedef {import("#src/app/shipping-address/dtos/get-shipping-address.dto").GetShippingAddressDto} GetShippingAddressPort
 * @typedef {import("#src/app/shipping-address/dtos/update-shipping-address.dto").UpdateShippingAddressDto} UpdateShippingAddressPort
 */

/**
 * Create shipping address
 * @param {CreateShippingAddressPort & {userId: string}} payload
 * @returns {Promise<ShippingAddressModel>}
 */
export const createUserShippingAddressService = async (payload) => {
  const totalCount = await countAllShippingAddressRepository({
    customer: payload.userId,
    isDefault: true,
  });

  if (totalCount > 0 && payload.isDefault) {
    await unsetDefaultCurrentShippingAddressRepository(payload.userId);
  } else if (totalCount === 0) {
    payload.isDefault = true;
  }

  const province = await getProvinceService(payload.provinceId);
  Assert.isTrue(province, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' }));

  const district = await getDistrictService(payload.districtId, payload.provinceId);
  Assert.isTrue(district, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' }));

  const ward = await getWardService(payload.wardCode, payload.districtId);
  Assert.isTrue(ward, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' }));

  const shippingAddress = await createShippingAddressRepository({
    isDefault: payload.isDefault,
    address: payload.address,
    provinceName: province.ProvinceName,
    districtName: district.DistrictName,
    wardName: ward.WardName,
    customer: payload.userId,
  });

  // Clear cache
  await deleteShippingAddressFromCache(shippingAddress._id);

  return shippingAddress;
};

/**
 * Create shipping address
 * @param {GetListShippingAddressPort & {userId: string}} payload
 * @returns {Promise<[number, ShippingAddressModel[]]>}
 */
export const getAllUserShippingAddressesService = async (payload) => {
  const filters = {
    customer: payload.userId,
  };

  const cached = await getListShippingAddressFromCache({ ...filters, ...payload });
  if (cached && Array.isArray(cached) && cached.length === 2 && cached[0] > 0) {
    return cached;
  }

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, listShippingAddress] = await getAndCountShippingAddressRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  await setListShippingAddressToCache({ ...filters, ...payload }, totalCount, listShippingAddress);

  return [totalCount, listShippingAddress];
};

/**
 * Get shipping address
 * @param {GetShippingAddressPort & {userId: string}} payload
 * @returns {Promise<ShippingAddressModel>}
 */
export const getUserShippingAddressByIdOrFailService = async (payload) => {
  const cached = await getShippingAddressFromCache(payload.shippingAddressId);
  if (cached) {
    return cached;
  }

  const shippingAddress = await getShippingAddressByIdRepository(payload.shippingAddressId, {
    customer: payload.userId,
  });
  Assert.isTrue(
    shippingAddress,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' }),
  );

  await setShippingAddressToCache(payload.shippingAddressId, shippingAddress);

  return shippingAddress;
};

/**
 * Update shipping address
 * @param {UpdateShippingAddressPort & {userId: string}} payload
 * @returns {Promise<ShippingAddressModel>}
 */
export const updateUserShippingAddressByIdOrFailService = async (payload) => {
  if (payload.isDefault) {
    await unsetDefaultCurrentShippingAddressRepository(payload.userId);
  }

  const province = await getProvinceService(payload.provinceId);
  Assert.isTrue(province, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' }));

  const district = await getDistrictService(payload.districtId, payload.provinceId);
  Assert.isTrue(district, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' }));

  const ward = await getWardService(payload.wardCode, payload.districtId);
  Assert.isTrue(ward, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' }));

  const updatedShippingAddress = await updateShippingAddressByIdRepository(payload.shippingAddressId, {
    isDefault: payload.isDefault,
    provinceName: province.ProvinceName,
    districtName: district.DistrictName,
    wardName: ward.WardName,
  });
  Assert.isTrue(
    updatedShippingAddress,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' }),
  );

  // Clear cache
  await deleteShippingAddressFromCache(updatedShippingAddress._id);

  return updatedShippingAddress;
};

/**
 * Remove shipping address
 * @param {GetShippingAddressPort & {userId: string}} payload
 * @returns {Promise<{id: string}>}
 */
export const removeUserShippingAddressByIdOrFailService = async (payload) => {
  const existShippingAddress = await getShippingAddressByIdRepository(payload.shippingAddressId, {
    customer: payload.userId,
  });
  Assert.isTrue(
    existShippingAddress,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' }),
  );

  await removeShippingAddressByIdRepository(existShippingAddress._id);

  // Clear cache
  await deleteShippingAddressFromCache(existShippingAddress._id);

  return { id: existShippingAddress._id };
};

/**
 * Update default shipping address
 * @param {GetShippingAddressPort & {userId: string}} payload
 * @returns {Promise<{id: string}>}
 */
export const setDefaultUserShippingAddressByIdOrFailService = async (payload) => {
  const existShippingAddress = await getShippingAddressByIdRepository(payload.shippingAddressId, {
    customer: payload.userId,
  });

  Assert.isTrue(
    existShippingAddress,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' }),
  );

  Assert.isFalse(
    existShippingAddress.isDefault,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Current address is default' }),
  );

  await unsetDefaultCurrentShippingAddressRepository(payload.userId);
  await setDefaultShippingAddressByIdRepository(existShippingAddress._id, payload.userId);

  // Clear cache
  await deleteShippingAddressFromCache(existShippingAddress._id);

  return { id: existShippingAddress._id };
};
