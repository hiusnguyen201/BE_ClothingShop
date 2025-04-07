import Joi from 'joi';

export const GetCustomerDto = Joi.object({
  customerId: Joi.string().required(),
});
