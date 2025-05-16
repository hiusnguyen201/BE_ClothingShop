import Joi from 'joi';

/**
 * @typedef {Object} GetCustomerDto
 * @property {string} customerId
 */
export const GetCustomerDto = Joi.object({
  customerId: Joi.string().required(),
});
