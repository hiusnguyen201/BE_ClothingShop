import Joi from 'joi';

export const PermissionDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
  module: Joi.string().required(),
  endpoint: Joi.string().required(),
  method: Joi.string().required(),
  isActive: Joi.boolean().required(),
  status: Joi.boolean().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
