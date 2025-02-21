import Joi from 'joi';
import { GENDER } from '#core/constant';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export const updateCustomersDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  phone: Joi.isPhoneNumber('+84').required(),
});
