import Joi from 'joi';
import { REGEX_PATTERNS } from '#core/constant';
import { UserConstant } from '#app/v2/users/UserConstant';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export const updateUserDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string().valid(...Object.values(UserConstant.GENDER)),
  role: Joi.string(),
  phone: Joi.string().custom((value, helper) => {
    if (!value.match(REGEX_PATTERNS.PHONE_NUMBER['+84'])) {
      return helper.message('Invalid vietnam phone number');
    }
    return value;
  }),
});
