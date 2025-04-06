import { ApiResponse } from "#src/core/api/ApiResponse";
import { ModelDto } from "#src/core/dto/ModelDto";
import {
  createShippingAddressService,
  getAllShippingAddressService,
  getShippingAddressByIdService,
  updateShippingAddressByIdService,
  removeShippingAddressByIdService,
  setDefaultShippingAddressByIdService,
  unsetDefaultCurrentShippingAddressService,
  countAllShippingAddressService,
} from "#src/app/shipping-address/shipping-address.service";
import { ShippingAddressDto } from "#src/app/shipping-address/dtos/shipping-address.dto";
import { HttpException } from "#src/core/exception/http-exception";
import { Code } from "#src/core/code/Code";

export const createShippingAddressController = async (req) => {
  // const { id } = req.user;
  const id = "67ed3bb1b80e7de1f2a03c0e"

  const totalCount = await countAllShippingAddressService({
    customer: id,
  });

  const newShippingAddress = await createShippingAddressService({
    ...req.body,
    ...(totalCount === 0 ? { isDefault: true } : {}),
    customer: id,
  });

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, newShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const getAllShippingAddressController = async (req) => {
  const { id } = req.user;
  const { limit, page } = req.query;

  const filterOptions = {
    customer: id,
  };

  const totalCount = await countAllShippingAddressService(filterOptions);

  const shippingAddress = await getAllShippingAddressService({
    filters: filterOptions,
    page,
    limit,
  });

  const shippingAddressDto = ModelDto.newList(ShippingAddressDto, shippingAddress);
  return ApiResponse.success({ totalCount, list: shippingAddressDto });
};

export const getShippingAddressByIdController = async (req) => {
  const { shippingAddressId } = req.params;
  const existShippingAddress = await getShippingAddressByIdService(
    shippingAddressId,
    req.user.id
  );

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, existShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const updateShippingAddressByIdController = async (req) => {
  const { shippingAddressId } = req.params;
  const existShippingAddress = await getShippingAddressByIdService(
    shippingAddressId,
    req.user._id
  );

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  const updatedShippingAddress = await updateShippingAddressByIdService(
    shippingAddressId,
    req.body
  );

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, updatedShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const removeShippingAddressByIdController = async (req) => {
  const { shippingAddressId } = req.params;
  const existShippingAddress = await getShippingAddressByIdService(
    shippingAddressId,
    req.user.id
  );

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  const shippingAddress = await removeShippingAddressByIdService(shippingAddressId);

  return ApiResponse.success({ id: shippingAddress._id });
};

export const setDefaultShippingAddressByIdController = async (req) => {
  const { shippingAddressId } = req.params;
  const { id } = req.user;
  const existShippingAddress = await getShippingAddressByIdService(
    shippingAddressId,
    id
  );

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  if (existShippingAddress.isDefault) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Current address is default' })
  }

  await unsetDefaultCurrentShippingAddressService(id);
  await setDefaultShippingAddressByIdService(shippingAddressId, id);

  return ApiResponse.success({ id: existShippingAddress._id });
};
