import Joi from 'joi';

export const PermissionDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  module: Joi.string().required(),
});
