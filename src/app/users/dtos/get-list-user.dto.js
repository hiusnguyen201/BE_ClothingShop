import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { GENDER } from '#src/app/users/users.constant';
import escapeStringRegexp from 'escape-string-regexp';

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
  sortBy: Joi.string().valid('name', 'email', 'lastLoginAt', 'gender', 'verifiedAt', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  gender: Joi.string().valid(...Object.values(GENDER)),
  status: Joi.string().valid('active', 'inactive'),
  roleId: Joi.string(),
});
