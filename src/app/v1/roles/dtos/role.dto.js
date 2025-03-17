import Joi from 'joi';

export const RoleDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
  isActive: Joi.boolean().required(),
  status: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
