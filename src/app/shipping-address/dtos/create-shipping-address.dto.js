import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

/**
 * @typedef {Object} CreateShippingAddressDto
 * @property {string} address
 * @property {number} provinceId
 * @property {number} districtId
 * @property {string} wardCode
 * @property {boolean} isDefault
 */
export const CreateShippingAddressDto = Joi.object({
  address: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  provinceId: Joi.number().required(),
  districtId: Joi.number().required(),
  wardCode: Joi.string().required(),
  isDefault: Joi.bool().required(),
});
