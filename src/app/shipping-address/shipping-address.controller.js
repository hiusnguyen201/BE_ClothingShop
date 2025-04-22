import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import {
  createShippingAddressService,
  getShippingAddressByIdService,
  updateShippingAddressByIdService,
  removeShippingAddressByIdService,
  setDefaultShippingAddressByIdService,
  unsetDefaultCurrentShippingAddressService,
  countAllShippingAddressService,
  getAndCountShippingAddressService,
} from '#src/app/shipping-address/shipping-address.service';
import { ShippingAddressDto } from '#src/app/shipping-address/dtos/shipping-address.dto';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';
import { getDistrictService, getProvinceService, getWardService } from '#src/modules/GHN/ghn.service';
import { validateSchema } from '#src/core/validations/request.validation';
import { GetShippingAddressDto } from '#src/app/shipping-address/dtos/get-shipping-address.dto';
import { CreateShippingAddressDto } from '#src/app/shipping-address/dtos/create-shipping-address.dto';
import { GetListShippingAddressDto } from '#src/app/shipping-address/dtos/get-list-shipping-address.dto';
import { UpdateShippingAddressDto } from '#src/app/shipping-address/dtos/update-shipping-address.dto';

export const createShippingAddressController = async (req) => {
  const { id } = req.user;
  const adapter = await validateSchema(CreateShippingAddressDto, req.body);

  const totalCount = await countAllShippingAddressService({
    customer: id,
    isDefault: true,
  });

  if (totalCount > 0 && adapter.isDefault) {
    await unsetDefaultCurrentShippingAddressService(id);
  } else if (totalCount === 0) {
    adapter.isDefault = true;
  }

  const province = await getProvinceService(adapter.provinceCode);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const district = await getDistrictService(adapter.districtCode, adapter.provinceCode);
  if (!district) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const ward = await getWardService(adapter.wardCode, adapter.districtCode);
  if (!ward) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' });
  }

  const newShippingAddress = await createShippingAddressService({
    isDefault: adapter.isDefault,
    address: adapter.address,
    provinceName: province.ProvinceName,
    districtName: district.DistrictName,
    wardName: ward.WardName,
    customer: id,
  });

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, newShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const getAllShippingAddressController = async (req) => {
  const adapter = await validateSchema(GetListShippingAddressDto, req.query);

  const filters = {
    customer: req.user.id,
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, shippingAddress] = await getAndCountShippingAddressService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const shippingAddressDto = ModelDto.newList(ShippingAddressDto, shippingAddress);
  return ApiResponse.success({ totalCount, list: shippingAddressDto });
};

export const getShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(GetShippingAddressDto, req.params);

  const existShippingAddress = await getShippingAddressByIdService(adapter.shippingAddressId, {
    customer: req.user.id,
  });

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' });
  }

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, existShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const updateShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(UpdateShippingAddressDto, { ...req.params, ...req.body });

  if (adapter.isDefault) {
    await unsetDefaultCurrentShippingAddressService(req.user.id);
  }

  const province = await getProvinceService(adapter.provinceCode);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const district = await getDistrictService(adapter.districtCode, adapter.provinceCode);
  if (!district) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const ward = await getWardService(adapter.wardCode, adapter.districtCode);
  if (!ward) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Ward not found' });
  }

  const updatedShippingAddress = await updateShippingAddressByIdService(adapter.shippingAddressId, {
    isDefault: adapter.isDefault,
    provinceName: province.ProvinceName,
    districtName: district.DistrictName,
    wardName: ward.WardName,
  });
  if (!updatedShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' });
  }

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, updatedShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const removeShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(GetShippingAddressDto, req.params);

  const existShippingAddress = await getShippingAddressByIdService(adapter.shippingAddressId, {
    customer: req.user.id,
  });

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' });
  }

  const shippingAddress = await removeShippingAddressByIdService(existShippingAddress._id);

  return ApiResponse.success({ id: shippingAddress._id });
};

export const setDefaultShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(GetShippingAddressDto, req.params);

  const existShippingAddress = await getShippingAddressByIdService(adapter.shippingAddressId, {
    customer: req.user.id,
  });

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' });
  }

  if (existShippingAddress.isDefault) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Current address is default' });
  }

  await unsetDefaultCurrentShippingAddressService(req.user.id);
  await setDefaultShippingAddressByIdService(existShippingAddress._id, req.user.id);

  return ApiResponse.success({ id: existShippingAddress._id });
};
