import Joi from 'joi';

export const CreateOrderGhnDto = Joi.object({
  orderId: Joi.string().required(),
});
