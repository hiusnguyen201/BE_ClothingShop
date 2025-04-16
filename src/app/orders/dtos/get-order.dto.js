import Joi from 'joi';

export const GetOrderDto = Joi.object({
  orderId: Joi.string().required(),
});
