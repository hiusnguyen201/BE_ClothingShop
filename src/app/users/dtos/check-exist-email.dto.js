import Joi from 'joi';

/**
 * @typedef {Object} CheckExistEmailDto
 * @property {string} email
 */
export const CheckExistEmailDto = Joi.object({
  email: Joi.string().email().required(),
});
