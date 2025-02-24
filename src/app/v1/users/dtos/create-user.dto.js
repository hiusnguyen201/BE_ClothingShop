import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';
import { UserConstant } from '#app/v2/users/UserConstant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const createUserDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
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
