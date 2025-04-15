import Joi from 'joi';

export const ProductDto = Joi.object({
  _id: Joi.string().required(),
  thumbnail: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.any().required(),
  subCategory: Joi.any().allow(null),
  status: Joi.string().required(),
  productOptions: Joi.array().items(Joi.any()).required(),
  productVariants: Joi.array().items(Joi.any()).required(),
});
