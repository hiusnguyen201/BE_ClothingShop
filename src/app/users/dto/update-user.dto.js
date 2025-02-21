import Joi from 'joi';
import { GENDER } from '#core/constant';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export const updateUserDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  roleId: Joi.string(),
  phone: Joi.isPhoneNumber('+84'),
});
