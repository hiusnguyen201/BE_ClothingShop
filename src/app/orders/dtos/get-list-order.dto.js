import { ORDER_STATUS } from '#src/app/orders/orders.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import escapeStringRegexp from 'escape-string-regexp';
import Joi from 'joi';

/**
 * @typedef {Object} GetListOrderDto
 * @property {string} [keyword]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sortBy]
 * @property {string} [sortOrder]
 * @property {string} [status]
 * @property {number} [minTotal]
 * @property {number} [maxTotal]
 */
export const GetListOrderDto = Joi.object({
  page: Joi.number()
    .min(1)
    .default(1)
    .custom((value) => +value),
  keyword: Joi.string()
    .default('')
    .allow('')
    .custom((val) => escapeStringRegexp(replaceMultiSpacesToSingleSpace(val))),
  limit: Joi.number().min(10).max(500).default(10),
  sortBy: Joi.string().valid('code', 'orderDate', 'total', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .optional(),
  minTotal: Joi.number().min(0),
  maxTotal: Joi.number().min(0),
});
