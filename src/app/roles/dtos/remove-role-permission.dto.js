import Joi from 'joi';

/**
 * @typedef {Object} RemoveRolePermissionDto
 * @property {string} roleId
 * @property {string} permissionId
 */
export const RemoveRolePermissionDto = Joi.object({
  roleId: Joi.string().required(),
  permissionId: Joi.string().required(),
});
