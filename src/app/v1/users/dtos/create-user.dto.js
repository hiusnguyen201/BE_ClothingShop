import Joi from 'joi';
import { GENDER } from '#src/app/v1/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const CreateUserDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  gender: Joi.string()
    .required()
    .valid(...Object.values(GENDER)),
  phone: Joi.phoneNumber('VN').required(),
  roleId: Joi.string(),
});
