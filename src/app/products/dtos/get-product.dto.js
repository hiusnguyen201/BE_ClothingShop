import Joi from 'joi';

export const GetProductDto = Joi.object({
  productId: Joi.string().required(),
});
