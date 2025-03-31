import Joi from 'joi';
import { GENDER } from '#src/app/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const EditProfileDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email().trim(),
  phone: Joi.phoneNumber('VN'),
  gender: Joi.string().valid(...Object.values(GENDER)),
})
  .min(1)
  .message('Update profile must have at least 1 key');
