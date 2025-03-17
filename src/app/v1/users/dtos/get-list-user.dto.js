import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { GENDER, USER_STATUS } from '#src/app/v1/users/users.constant';

export const GetListUserDto = Joi.object({
  keyword: Joi.string()
    .default('')
    .allow('')
    .custom((val) => replaceMultiSpacesToSingleSpace(val)),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(10).max(100).default(10),
  sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid(...Object.values(USER_STATUS)),
  gender: Joi.string().valid(...Object.values(GENDER)),
});
