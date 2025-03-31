import Joi from 'joi';

export const UpdateListRolePermissionsDto = Joi.object({
  roleId: Joi.string().required(),
  permissionIds: Joi.array().required().items(Joi.string()),
});
