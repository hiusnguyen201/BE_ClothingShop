import Joi from 'joi';

export const AddRolePermissionsDto = Joi.object({
  roleId: Joi.string().required(),
  permissionIds: Joi.array().items(Joi.string()).min(1).required(),
});
