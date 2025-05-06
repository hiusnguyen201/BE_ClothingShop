import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const GetAssignedRolePermissionsDto = Joi.object({
  roleId: Joi.string().required(),
  keyword: Joi.string()
    .default('')
    .allow('')
    .custom((val) => replaceMultiSpacesToSingleSpace(val)),
  page: Joi.number()
    .min(1)
    .default(1)
    .custom((value) => +value),
  limit: Joi.number()
    .min(5)
    .max(100)
    .default(5)
    .custom((value) => +value),
  sortBy: Joi.string().valid('name', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
