import Joi from 'joi';
import { GENDER, USER_STATUS } from '#src/app/users/users.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import escapeStringRegexp from 'escape-string-regexp';
import { SORT_ORDER_VALUES } from '#src/core/constant';
import { CUSTOMER_SORT_KEYS } from '#src/app/customers/customers.constant';

/**
 * @typedef {Object} GetListRoleDto
 * @property {string} [keyword]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sortBy]
 * @property {string} [sortOrder]
 * @property {string} [status]
 * @property {string} [gender]
 */
export const GetListCustomerDto = Joi.object({
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
    .valid(...CUSTOMER_SORT_KEYS)
    .default(CUSTOMER_SORT_KEYS[0]),
  sortOrder: Joi.string()
    .valid(...SORT_ORDER_VALUES)
    .default(SORT_ORDER_VALUES[0]),
  status: Joi.string().valid(...Object.values(USER_STATUS)),
  gender: Joi.string().valid(...Object.values(GENDER)),
});
