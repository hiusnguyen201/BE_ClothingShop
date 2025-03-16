import Joi from 'joi';

export const CategoryDto = Joi.object({
  _id: Joi.string(),
  image: Joi.string().allow(null),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  isHide: Joi.boolean().required(),
  level: Joi.number().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
