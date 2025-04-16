import Joi from 'joi';

export const GetRoleDto = Joi.object({
  roleId: Joi.string().required(),
});
