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
  const { id } = req.user;

  const totalCount = await countAllShippingAddressService({
    customer: id,
  });

  if (totalCount < 1) {
    req.body.isDefault = true;
  }

  if (totalCount > 0 && req.body.isDefault === true) {
    await unsetDefaultCurrentShippingAddressService(id);
  }

  const newShippingAddress = await createShippingAddressService({
    ...req.body,
    customer: id,
  });

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, newShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const getAllShippingAddressController = async (req) => {
  const { id } = req.user;
  const { limit, page, sortBy, sortOrder } = req.query;

  const filters = {
    customer: id,
  };

  const totalCount = await countAllShippingAddressService(filters);

  const shippingAddress = await getAllShippingAddressService({
    filters: filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const shippingAddressDto = ModelDto.newList(ShippingAddressDto, shippingAddress);
  return ApiResponse.success({ totalCount, list: shippingAddressDto });
};

export const getShippingAddressByIdController = async (req) => {
  const { id } = req.user;
  const { shippingAddressId } = req.params;

  const existShippingAddress = await getShippingAddressByIdService(shippingAddressId, {
    customer: id
  });

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, existShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const updateShippingAddressByIdController = async (req) => {
  const { id } = req.user;
  const { shippingAddressId } = req.params;
  const { isDefault } = req.body;

  const existShippingAddress = await getShippingAddressByIdService(shippingAddressId, {
    customer: id
  });

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  if (isDefault) {
    await unsetDefaultCurrentShippingAddressService(id);
  }

  if (existShippingAddress.isDefault && isDefault === false) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Have at least 1 shipping address as default' })
  }

  const updatedShippingAddress = await updateShippingAddressByIdService(
    shippingAddressId,
    req.body
  );

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, updatedShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const removeShippingAddressByIdController = async (req) => {
  const { id } = req.user;
  const { shippingAddressId } = req.params;

  const existShippingAddress = await getShippingAddressByIdService(shippingAddressId, {
    customer: id
  });

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  const shippingAddress = await removeShippingAddressByIdService(existShippingAddress._id);

  return ApiResponse.success({ id: shippingAddress._id });
};

export const setDefaultShippingAddressByIdController = async (req) => {
  const { id } = req.user;
  const { shippingAddressId } = req.params;

  const existShippingAddress = await getShippingAddressByIdService(shippingAddressId, {
    customer: id
  });

  if (!existShippingAddress) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Shipping address not found' })
  }

  if (existShippingAddress.isDefault) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Current address is default' })
  }

  await unsetDefaultCurrentShippingAddressService(id);
  await setDefaultShippingAddressByIdService(existShippingAddress._id, id);

  return ApiResponse.success({ id: existShippingAddress._id });
};
