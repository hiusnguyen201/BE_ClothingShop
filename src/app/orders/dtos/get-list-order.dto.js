import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const GetListOrderDto = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(10).max(500).default(10),
  sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  customerId: Joi.string().custom(objectIdValidator),
  paymentId: Joi.string().custom(objectIdValidator),
});
