import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const updateShippingAddressDto = Joi.object({
  address: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  provinceCode: Joi.string().required(),
  districtCode: Joi.string().required(),
  wardCode: Joi.string().required(),
  isDefault: Joi.bool().required(),
});
