import Joi from 'joi';

/**
 * @typedef {Object} UserDto
 * @property {string} _id
 * @property {avatar | null} avatar
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string | null} gender
 * @property {string | null} role
 * @property {Date | null} verifiedAt
 * @property {Date | null} lastLoginAt
 * @property {any | undefined} permissions
 */
export const UserDto = Joi.object({
  _id: Joi.any().required(),
  avatar: Joi.string().allow(null),
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().allow(null),
  role: Joi.any(),
  verifiedAt: Joi.date().allow(null),
  lastLoginAt: Joi.date().allow(null),
  permissions: Joi.any().optional(),
});
