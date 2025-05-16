import Joi from 'joi';

export const GetCustomerOrderDto = Joi.object({
  customerId: Joi.string().required(),
  orderId: Joi.string().required(),
});
