import Joi from 'joi';

export const ProductDiscountDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  amount: Joi.number().required(),
  isFixed: Joi.boolean().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  productVariant: Joi.any().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
