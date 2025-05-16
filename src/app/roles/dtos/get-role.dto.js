import Joi from 'joi';

/**
 * @typedef {Object} GetRoleDto
 * @property {string} roleId
 */
export const GetRoleDto = Joi.object({
  roleId: Joi.string().required(),
});
