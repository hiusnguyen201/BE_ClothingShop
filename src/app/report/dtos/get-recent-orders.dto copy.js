import Joi from 'joi';

/**
 * @typedef {Object} GetRecentOrdersDto
 * @property {string} type
 */
export const GetRecentOrdersDto = Joi.object({
  limit: Joi.number().valid(5, 10).default(5),
});
