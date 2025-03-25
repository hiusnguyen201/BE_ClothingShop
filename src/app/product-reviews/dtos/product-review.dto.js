import Joi from 'joi';

export const ProductReviewDto = Joi.object({
  _id: Joi.string().required(),
  comment: Joi.string().required(),
  score: Joi.number().required(),
  product: Joi.string().required(),
  customer: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
