import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";
import { REGEX_PATTERNS } from "#src/core/constant";
import {
  getDistrictByCodeService,
  getProvinceByCodeService,
  getWardByCodeService,
} from "#src/app/divisions/divisions.service";

export const createShippingAddressDto = Joi.object({
  address: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  province: Joi.string()
    .pattern(REGEX_PATTERNS.STRING_NUMBER)
    .required()
    .custom((value, helpers) => {
      const province = getProvinceByCodeService(value);
      if (!province) {
        return helpers.message("Province is not found");
      }
      helpers.state.ancestors[0].details = { ...helpers.state.ancestors[0].details, provinceName: province.name };
      return value;
    }),
  district: Joi.string()
    .pattern(REGEX_PATTERNS.STRING_NUMBER)
    .required()
    .custom((value, helpers) => {
      const { province } = helpers.state.ancestors[0];
      const district = getDistrictByCodeService(value);
      if (!district || district.province_code !== province) {
        return helpers.message("District is not found");
      }
      helpers.state.ancestors[0].details = { ...helpers.state.ancestors[0].details, districtName: district.name };
      return value;
    }),
  ward: Joi.string()
    .pattern(REGEX_PATTERNS.STRING_NUMBER)
    .required()
    .custom((value, helpers) => {
      const { district } = helpers.state.ancestors[0];
      const ward = getWardByCodeService(value);
      if (!ward || ward.district_code !== district) {
        return helpers.message("Ward is not found");
      }
      helpers.state.ancestors[0].details = { ...helpers.state.ancestors[0].details, wardName: ward.name };
      return value;
    }),
  isDefault: Joi.bool()
    .required(),
}).custom((value, helpers) => {
  const { address, isDefault } = value;
  const { provinceName, districtName, wardName, } = value.details;
  return {
    address: address,
    province: provinceName,
    district: districtName,
    ward: wardName,
    isDefault: isDefault
  }
});
