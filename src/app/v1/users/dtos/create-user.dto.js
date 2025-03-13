import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';
import { GENDER } from '#app/v1/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const CreateUserDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  role: Joi.string(),
  phone: Joi.string().custom((value, helper) => {
    if (!value.match(REGEX_PATTERNS.PHONE_NUMBER['+84'])) {
      return helper.message('Invalid vietnam phone number');
    }
    return value;
  }),
});
