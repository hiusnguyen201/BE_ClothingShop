import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { GENDER } from '#src/app/v1/users/users.constant';

export const RegisterDto = Joi.object({
  name: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  phone: Joi.phoneNumber('VN').required(),
  password: Joi.string().required().min(3).max(30),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  gender: Joi.string()
    .valid(...Object.values(GENDER))
    .required(),
  birthday: Joi.date(),
});
