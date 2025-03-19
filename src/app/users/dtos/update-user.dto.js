import Joi from 'joi';
import { GENDER } from '#src/app/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const UpdateUserDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  roleId: Joi.string(),
  phone: Joi.phoneNumber('VN'),
})
  .min(1)
  .message('Update user must have at least 1 key');
