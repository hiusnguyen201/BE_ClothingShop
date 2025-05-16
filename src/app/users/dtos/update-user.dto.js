import Joi from 'joi';
import { GENDER } from '#src/app/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

/**
 * @typedef {Object} UpdateUserDto
 * @property {string} userId
 * @property {string} name
 * @property {string} email
 * @property {string} gender
 * @property {string} phone
 * @property {string | null} [roleId]
 */
export const UpdateUserDto = Joi.object({
  userId: Joi.objectId().required(),
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
  roleId: Joi.any().allow(null),
})
  .min(1)
  .message('Update user must have at least 1 key');
