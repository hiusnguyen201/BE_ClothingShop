import Joi from 'joi';

export const userSchemaDto = Joi.object({
  id: Joi.string(),
  avatar: Joi.string(),
  name: Joi.string(),
  phone: Joi.string(),
  gender: Joi.string(),
  email: Joi.string(),
  isVerified: Joi.boolean(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});
