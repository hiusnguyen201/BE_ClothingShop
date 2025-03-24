import Joi from 'joi';

export const ProductDiscountDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  amount: Joi.number().required(),
  is_fixed: Joi.boolean().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  product_variant: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
