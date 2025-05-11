import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { PRODUCT_STATUS } from '#src/app/products/products.constant';
import escapeStringRegexp from 'escape-string-regexp';
import { REGEX_PATTERNS } from '#src/core/constant';

export const GetListProductDto = Joi.object({
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
  sortBy: Joi.string().valid('name', 'status', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid(...Object.values(PRODUCT_STATUS)),
  categoryIds: Joi.string()
    .pattern(REGEX_PATTERNS.COMMA_SEPARATED_OBJECT_IDS)
    .message('categoryIds must be a comma-separated list of valid MongoDB ObjectIds')
    .custom((value) => value.split(',')),
  minPrice: Joi.number().min(0).max(1000000),
  maxPrice: Joi.number().min(0).max(1000000),
});
