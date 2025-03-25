import Joi from 'joi';

export const ProductDiscountDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  amount: Joi.number().required(),
  is_fixed: Joi.boolean().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().required(),
  product_variant: Joi.any().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
