import Joi from 'joi';

export const RoleDto = Joi.object({
  _id: Joi.string(),
  name: Joi.string(),
  slug: Joi.string(),
  description: Joi.string(),
  isActive: Joi.boolean(),
});
