import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ShippingAddressDto } from '#src/app/shipping-address/dtos/shipping-address.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { GetShippingAddressDto } from '#src/app/shipping-address/dtos/get-shipping-address.dto';
import { CreateShippingAddressDto } from '#src/app/shipping-address/dtos/create-shipping-address.dto';
import { GetListShippingAddressDto } from '#src/app/shipping-address/dtos/get-list-shipping-address.dto';
import { UpdateShippingAddressDto } from '#src/app/shipping-address/dtos/update-shipping-address.dto';
import {
  createUserShippingAddressService,
  getAllUserShippingAddressesService,
  getUserShippingAddressByIdOrFailService,
  removeUserShippingAddressByIdOrFailService,
  setDefaultUserShippingAddressByIdOrFailService,
  updateUserShippingAddressByIdOrFailService,
} from '#src/app/shipping-address/shipping-address.service';

export const createShippingAddressController = async (req) => {
  const adapter = await validateSchema(CreateShippingAddressDto, req.body);

  const shippingAddress = await createUserShippingAddressService({ ...adapter, userId: req.user.id });

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, shippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const getAllShippingAddressController = async (req) => {
  const adapter = await validateSchema(GetListShippingAddressDto, req.query);

  const [totalCount, listShippingAddress] = await getAllUserShippingAddressesService({
    ...adapter,
    userId: req.user.id,
  });

  const shippingAddressDto = ModelDto.newList(ShippingAddressDto, listShippingAddress);
  return ApiResponse.success({ totalCount, list: shippingAddressDto }, 'Get list shipping address successful');
};

export const getShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(GetShippingAddressDto, req.params);

  const shippingAddress = await getUserShippingAddressByIdOrFailService({ ...adapter, userId: req.user.id });

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, shippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const updateShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(UpdateShippingAddressDto, { ...req.params, ...req.body });

  const updatedShippingAddress = await updateUserShippingAddressByIdOrFailService({ ...adapter, userId: req.user.id });

  const shippingAddressDto = ModelDto.new(ShippingAddressDto, updatedShippingAddress);
  return ApiResponse.success(shippingAddressDto);
};

export const removeShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(GetShippingAddressDto, req.params);

  const data = await removeUserShippingAddressByIdOrFailService({ ...adapter, userId: req.user.id });

  return ApiResponse.success(data, 'Remove shipping address successful');
};

export const setDefaultShippingAddressByIdController = async (req) => {
  const adapter = await validateSchema(GetShippingAddressDto, req.params);

  const data = await setDefaultUserShippingAddressByIdOrFailService({ ...adapter, userId: req.user.id });

  return ApiResponse.success(data, 'Set default shipping address successful');
};
