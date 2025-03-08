import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';
import { UserConstant } from '#app/v2/users/UserConstant';

export const updateCustomersDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string().valid(...Object.values(UserConstant.GENDER)),
  phone: Joi.phoneNumber('+84').required(),
});
