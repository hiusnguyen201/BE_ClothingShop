import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import escapeStringRegexp from 'escape-string-regexp';

/**
 * @typedef {Object} GetListRoleDto
 * @property {string} [keyword]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sortBy]
 * @property {string} [sortOrder]
 */
export const GetListRoleDto = Joi.object({
  keyword: Joi.string()
    .default('')
    .allow('')
    .custom((val) => escapeStringRegexp(replaceMultiSpacesToSingleSpace(val))),
  page: Joi.number()
    .min(1)
    .default(1)
    .custom((value) => +value),
  limit: Joi.number()
    .min(5)
    .max(100)
    .default(5)
    .custom((value) => +value),
  sortBy: Joi.string().valid('name', 'description', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
