import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { GENDER, USER_SORT_KEYS, USER_STATUS } from '#src/app/users/users.constant';
import { SORT_ORDER_VALUES } from '#src/core/constant';
import escapeStringRegexp from 'escape-string-regexp';

/**
 * @typedef {Object} GetListUserDto
 * @property {string} [keyword]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sortBy]
 * @property {string} [sortOrder]
 * @property {string} [gender]
 * @property {string} [status]
 * @property {string} [roleId]
 */
export const GetListUserDto = Joi.object({
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
  sortBy: Joi.string()
    .valid(...USER_SORT_KEYS)
    .default(USER_SORT_KEYS[0]),
  sortOrder: Joi.string()
    .valid(...SORT_ORDER_VALUES)
    .default(SORT_ORDER_VALUES[0]),
  gender: Joi.string().valid(...Object.values(GENDER)),
  status: Joi.string().valid(...Object.values(USER_STATUS)),
  roleId: Joi.string(),
});
