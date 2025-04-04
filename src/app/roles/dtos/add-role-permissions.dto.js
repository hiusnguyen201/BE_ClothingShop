import Joi from 'joi';

export const AddRolePermissionsDto = Joi.object({
  permissionIds: Joi.array().items(Joi.string()).min(1).required(),
});
