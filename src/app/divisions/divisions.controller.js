import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ProvinceDto } from '#src/app/divisions/dtos/province.dto';
import { DistrictDto } from '#src/app/divisions/dtos/district.dto';
import { WardDto } from '#src/app/divisions/dtos/ward.dto';
import {
  getAllProvincesService,
  getDistrictsByProvinceIdService,
  getWardsByDistrictIdService,
} from '#src/modules/GHN/ghn.service';
import { checkValidAddressService } from '#src/modules/geoapify/geoapify.service';
import { CheckValidAddressDto } from '#src/app/divisions/dtos/check-valid-address.dto';

/**
 * Get all provinces
 * @param {*} req
 * @returns
 */
export const getAllProvincesController = async (req) => {
  const provinces = await getAllProvincesService();

  const provincesDto = ModelDto.newList(
    ProvinceDto,
    provinces.filter((item) => item.IsEnable === 1),
  );

  return ApiResponse.success({ totalCount: provinces.length, list: provincesDto }, 'Get all provinces successfully');
};

/**
 * Get all districts by province code
 * @param {*} req
 * @returns
 */
export const getAllDistrictsByProvinceCodeController = async (req) => {
  const { provinceCode } = req.params;

  const districts = await getDistrictsByProvinceIdService(provinceCode);

  const districtsDto = ModelDto.newList(
    DistrictDto,
    districts.filter((item) => item.IsEnable === 1),
  );

  return ApiResponse.success({ totalCount: districts.length, list: districtsDto }, 'Get all districts successfully');
};

/**
 * Get all wards by district code
 * @param {*} req
 * @returns
 */
export const getAllWardsByDistrictCodeController = async (req) => {
  const { districtCode } = req.params;
  const wards = await getWardsByDistrictIdService(districtCode);

  const wardsDto = ModelDto.newList(
    WardDto,
    wards.filter((item) => item.IsEnable === 1),
  );

  return ApiResponse.success({ totalCount: wards.length, list: wardsDto }, 'Get all wards successfully');
};

/**
 * Check valid address
 * @param {*} req
 * @returns
 */
export const checkValidAddressController = async (req) => {
  const adapter = await validateSchema(CheckValidAddressDto, req.body);

  const valid = await checkValidAddressService(adapter.address);

  return ApiResponse.success(valid);
};
