import Joi from 'joi';

/**
 * @typedef {Object} PermissionDto
 * @property {string} _id
 * @property {string} name
 * @property {string} description
 * @property {string} module
 */
export const PermissionDto = Joi.object({
  _id: Joi.any().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  module: Joi.string().required(),
});
