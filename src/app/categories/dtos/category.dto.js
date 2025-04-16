import Joi from 'joi';

export const CategoryDto = Joi.object({
  _id: Joi.any().required(),
  image: Joi.string().allow(null),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  level: Joi.number().required(),
  parent: Joi.any().allow(null),
  children: Joi.array().items(Joi.link('#category')).default([]),
}).id('category');
