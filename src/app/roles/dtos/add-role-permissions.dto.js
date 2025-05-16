import Joi from 'joi';

/**
 * @typedef {Object} AddRolePermissionsDto
 * @property {string} roleId
 * @property {string[]} permissionIds
 */
export const AddRolePermissionsDto = Joi.object({
  roleId: Joi.string().required(),
  permissionIds: Joi.array().items(Joi.string()).min(1).required(),
});
