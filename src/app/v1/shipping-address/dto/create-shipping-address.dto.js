import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';

export const createShippingAddressDto = Joi.object({
  customerName: Joi.string().required().min(3).max(50),
  customerPhone: Joi.string()
    .required()
    .custom((value, helper) => {
      if (!value.match(REGEX_PATTERNS.PHONE_VIETNAM)) {
        return helper.message('Invalid vietnam phone number');
      }
      return value;
    }),
  address: Joi.string().required().min(3).max(255),
  province: Joi.string().required().min(1).max(50),
  district: Joi.string().required().min(1).max(50),
  ward: Joi.string().required().min(1).max(50),
  isDefault: Joi.boolean().required(),
});
