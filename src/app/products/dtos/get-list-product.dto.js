import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const GetListProductDto = Joi.object({
  keyword: Joi.string()
    .default('')
    .allow('')
    .custom((val) => replaceMultiSpacesToSingleSpace(val)),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(10).max(100).default(10),
  sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  roleId: Joi.string(),
  category: Joi.string(),
  tag: Joi.string(),
  is_hidden: Joi.boolean()
});
