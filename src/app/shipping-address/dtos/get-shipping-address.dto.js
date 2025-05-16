import Joi from 'joi';

/**
 * @typedef {Object} GetShippingAddressDto
 * @property {string} shippingAddressId
 */
export const GetShippingAddressDto = Joi.object({
  shippingAddressId: Joi.string().required(),
});
