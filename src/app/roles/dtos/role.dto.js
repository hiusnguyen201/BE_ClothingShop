import Joi from 'joi';

export const RoleDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
});
