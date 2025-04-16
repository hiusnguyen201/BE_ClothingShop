import Joi from 'joi';

export const CartDto = Joi.object({
  _id: Joi.string(),
  productId: Joi.any().required(),
  productVariantId: Joi.any().required(),
  name: Joi.string().required(),
  quantity: Joi.number().required(),
});