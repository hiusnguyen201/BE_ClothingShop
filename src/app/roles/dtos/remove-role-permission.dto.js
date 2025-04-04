import Joi from 'joi';

export const RemoveRolePermissionDto = Joi.object({
  roleId: Joi.string().required(),
  permissionId: Joi.string().required(),
});
