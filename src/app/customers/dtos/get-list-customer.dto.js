import Joi from 'joi';
import { GENDER } from '#src/app/users/users.constant';

export const GetListCustomerDto = Joi.object({
  keyword: Joi.string()
    .default('')
    .allow('')
    .custom((val) => replaceMultiSpacesToSingleSpace(val)),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(10).max(100).default(10),
  sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  gender: Joi.string().valid(...Object.values(GENDER)),
});
