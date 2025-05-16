import Joi from 'joi';

/**
 * @typedef {Object} RoleDto
 * @property {string} _id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 */
export const RoleDto = Joi.object({
  _id: Joi.any().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
});
