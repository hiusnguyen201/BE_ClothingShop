import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';
import { UserConstant } from '#src/app/v2/users/UserConstant';

export const registerDto = Joi.object({
  name: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(3).max(30),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  gender: Joi.string().valid(...Object.values(UserConstant.GENDER)),
  phone: Joi.phoneNumber('+84').required(),
  birthday: Joi.date(),
});
