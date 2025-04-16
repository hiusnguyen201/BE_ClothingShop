import Joi from 'joi';

export const AddUserPermissionsDto = Joi.object({
  permissionIds: Joi.array().items(Joi.string()).min(1).required(),
});
