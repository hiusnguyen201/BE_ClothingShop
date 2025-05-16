import Joi from 'joi';

/**
 * @typedef {Object} GetListShippingAddressDto
 * @property {string} [keyword]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sortBy]
 * @property {string} [sortOrder]
 */
export const GetListShippingAddressDto = Joi.object({
  page: Joi.number()
    .min(1)
    .default(1)
    .custom((value) => +value),
  limit: Joi.number().min(10).max(500).default(10),
  sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
