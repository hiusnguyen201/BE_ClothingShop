import Joi from 'joi';

export const RemoveUserPermissionDto = Joi.object({
  userId: Joi.string().required(),
  permissionId: Joi.string().required(),
});
