import {
  getAllProvincesService,
  getAllDistrictsByProvinceCodeService,
  getAllWardsByDistrictCodeService,
  getDistrictByCodeService,
  getProvinceByCodeService,
} from '#src/app/divisions/divisions.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ProvinceDto } from '#src/app/divisions/dtos/province.dto';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';
import { DistrictDto } from '#src/app/divisions/dtos/district.dto';
import { WardDto } from '#src/app/divisions/dtos/ward.dto';

/**
 * Get all provinces
 * @param {*} req
 * @returns
 */
export const getAllProvincesController = async (req) => {
  const provinces = getAllProvincesService();

  const provincesDto = ModelDto.newList(ProvinceDto, provinces);

  return ApiResponse.success({ totalCount: provinces.length, list: provincesDto }, 'Get all provinces successfully');
};

/**
 * Get all districts by province code
 * @param {*} req
 * @returns
 */
export const getAllDistrictsByProvinceCodeController = async (req) => {
  const { provinceCode } = req.params;
  const province = getProvinceByCodeService(provinceCode);
  if (!province) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Province not found' });
  }

  const districts = getAllDistrictsByProvinceCodeService(provinceCode);

  const districtsDto = ModelDto.newList(DistrictDto, districts);

  return ApiResponse.success({ totalCount: districts.length, list: districtsDto }, 'Get all districts successfully');
};

/**
 * Get all wards by district code
 * @param {*} req
 * @returns
 */
export const getAllWardsByDistrictCodeController = async (req) => {
  const { districtCode } = req.params;
  const district = getDistrictByCodeService(districtCode);
  if (!district) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'District not found' });
  }

  const wards = getAllWardsByDistrictCodeService(districtCode);

  const wardsDto = ModelDto.newList(WardDto, wards);

  return ApiResponse.success({ totalCount: wards.length, list: wardsDto }, 'Get all wards successfully');
};
