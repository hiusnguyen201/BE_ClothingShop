import Joi from 'joi';
import { GENDER } from '#src/app/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const EditProfileDto = Joi.object({
  avatar: Joi.alternatives().try(Joi.binary().strict(), Joi.string().strict()).optional(),
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  phone: Joi.phoneNumber('VN').required(),
  gender: Joi.string()
    .required()
    .valid(...Object.values(GENDER)),
})
  .min(1)
  .message('Update profile must have at least 1 key');
