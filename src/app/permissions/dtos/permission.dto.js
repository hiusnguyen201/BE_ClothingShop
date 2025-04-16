import Joi from 'joi';

export const PermissionDto = Joi.object({
  _id: Joi.any().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  module: Joi.string().required(),
});
