import Joi from 'joi';

export const ProductDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  short_description: Joi.string().allow(null),
  content: Joi.string().allow(null),
  category: Joi.any().required(),
  sub_category: Joi.string().allow(null),
  product_variants: Joi.array().items(Joi.object()).allow(null),
  tags: Joi.array().items(Joi.string()).allow(null),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});