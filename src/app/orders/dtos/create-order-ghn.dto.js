import Joi from 'joi';

export const createOrderGhnDto = Joi.object({
  orderId: Joi.string().required(),
});
