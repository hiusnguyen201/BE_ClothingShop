import HttpStatus from "http-status-codes";
import {
  getAllProvincesService,
  getAllDistrictsService,
  getAllWardsService,
  getAllDistrictsByProvinceCodeService,
  getAllWardsByDistrictCodeService,
  getDistrictByCodeService,
  getProvinceByCodeService,
  getWardByCodeService,
} from "#src/modules/divisions/divisions.service";
import { NotFoundException } from "#src/core/exception/http-exception";

/**
 * Get all provinces
 * @param {*} req
 * @returns
 */
export const getAllProvincesController = async (req) => {
  const provinces = getAllProvincesService();

  return {
    statusCode: HttpStatus.OK,
    message: "Get all provinces successfully",
    data: {
      totalCount: provinces.length,
      provinces,
    },
  };
};

/**
 * Get all districts
 * @param {*} req
 * @returns
 */
export const getAllDistrictsController = async (req) => {
  const districts = getAllDistrictsService();

  return {
    statusCode: HttpStatus.OK,
    message: "Get all districts successfully",
    data: {
      totalCount: districts.length,
      districts,
    },
  };
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
    throw new NotFoundException("Province not found");
  }

  const districts = getAllDistrictsByProvinceCodeService(provinceCode);

  return {
    statusCode: HttpStatus.OK,
    message: "Get all districts successfully",
    data: {
      totalCount: districts.length,
      districts,
    },
  };
};

/**
 * Get all wards
 * @param {*} req
 * @returns
 */
export const getAllWardsController = async (req) => {
  const wards = getAllWardsService();

  return {
    statusCode: HttpStatus.OK,
    message: "Get all wards successfully",
    data: {
      totalCount: wards.length,
      wards,
    },
  };
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
    throw new NotFoundException("District not found");
  }

  const wards = getAllWardsByDistrictCodeService(districtCode);

  return {
    statusCode: HttpStatus.OK,
    message: "Get all wards successfully",
    data: {
      totalCount: wards.length,
      wards,
    },
  };
};

/**
 * Get one province by code
 * @param {*} req
 * @returns
 */
export const getProvinceByCodeController = async (req) => {
  const { code } = req.params;
  const province = getProvinceByCodeService(code);
  if (!province) {
    throw new NotFoundException("Province not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one province successfully",
    data: province,
  };
};

/**
 * Get one district by code
 * @param {*} req
 * @returns
 */
export const getDistrictByCodeController = async (req) => {
  const { code } = req.params;
  const district = getDistrictByCodeService(code);
  if (!district) {
    throw new NotFoundException("District not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one district successfully",
    data: district,
  };
};

/**
 * Get one ward by code
 * @param {*} req
 * @returns
 */
export const getWardByCodeController = async (req) => {
  const { code } = req.params;
  const ward = getWardByCodeService(code);
  if (!ward) {
    throw new NotFoundException("Ward not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one ward successfully",
    data: ward,
  };
};
