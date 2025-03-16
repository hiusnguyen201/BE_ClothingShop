import Joi from 'joi';
import { GENDER } from '#src/app/v1/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const EditProfileDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email().trim(),
  phone: Joi.phoneNumber('VN').required(),
  gender: Joi.string()
    .required()
    .valid(...Object.values(GENDER)),
  birthday: Joi.date().iso(),
});
