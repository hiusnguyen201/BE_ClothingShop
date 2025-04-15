import Joi from 'joi';

export const CartDto = Joi.object({
  _id: Joi.string(),
  productVariantId: Joi.any().required(),
  name: Joi.string().required(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
});