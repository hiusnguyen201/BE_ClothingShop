import Joi from 'joi';

/**
 * @typedef {Object} GetOrderDto
 * @property {string} orderId
 */
export const GetOrderDto = Joi.object({
  orderId: Joi.string().required(),
});
