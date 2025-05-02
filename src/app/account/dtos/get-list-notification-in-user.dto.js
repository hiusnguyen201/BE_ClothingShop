import Joi from 'joi';

export const GetListNotificationInUserDto = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(5).max(100).default(5),
  sortBy: Joi.string().valid('createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
