import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export const registerDto = Joi.object({
  name: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(3).max(30),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  phone: Joi.isPhoneNumber('+84').required(),
});
