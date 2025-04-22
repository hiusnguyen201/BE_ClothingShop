import Joi from 'joi';

export const ProductVariantDto = Joi.object({
  _id: Joi.any().required(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
  sku: Joi.string().required(),
  sold: Joi.number().required(),

  variantValues: Joi.array().items(Joi.any()),

  product: Joi.any(),
});
