import Joi from 'joi';

export const PermissionDto = Joi.object({
  _id: Joi.string(),
  name: Joi.string(),
  slug: Joi.string(),
  description: Joi.string(),
  module: Joi.string(),
  endpoint: Joi.string(),
  method: Joi.string(),
  isActive: Joi.boolean(),
});
