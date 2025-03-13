import Joi from 'joi';
import { GENDER } from '#app/v1/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export const UpdateUserDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  role: Joi.string(),
  phone: Joi.phoneNumber('VN'),
});
