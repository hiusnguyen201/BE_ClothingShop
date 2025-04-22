import {
  getDistrictByCodeService,
  getProvinceByCodeService,
  getWardByCodeService,
} from '#src/app/divisions/divisions.service';
import { REGEX_PATTERNS } from '#src/core/constant';
import { objectIdValidator, replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import Joi from 'joi';

const UpdateShippingAddressDto = Joi.object({
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
        return helpers.message('Province is not found');
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
        return helpers.message('District is not found');
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
        return helpers.message('Ward is not found');
      }
      helpers.state.ancestors[0].details = { ...helpers.state.ancestors[0].details, wardName: ward.name };
      return value;
    }),
}).custom((value, helpers) => {
  const { address } = value;
  const { provinceName, districtName, wardName } = value.details;
  return {
    address: address,
    province: provinceName,
    district: districtName,
    ward: wardName,
  };
});

export const updateOrderDto = Joi.object({
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),
  productVariants: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().custom(objectIdValidator),
        quantity: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
  customerAddress: updateShippingAddressDto.required(),
  paymentMethod: Joi.string().required(),
  // .valid(...Object.values(PAYMENT_METHOD))
});

export const updateOrderCustomerDto = Joi.object({
  customerId: Joi.string().custom(objectIdValidator),
  provinceName: Joi.string().min(3).max(50),
  districtName: Joi.string().min(3).max(50),
  wardName: Joi.string().min(3).max(50),
  address: Joi.string().min(3).max(255),
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),
  shippingAddressId: Joi.string().required(),
  voucherId: Joi.string().custom(objectIdValidator).optional(),
  cartIds: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().custom(objectIdValidator),
        productId: Joi.string().custom(objectIdValidator),
        quantity: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
});
