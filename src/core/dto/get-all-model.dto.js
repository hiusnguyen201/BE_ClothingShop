import Joi from 'joi';

export const getAllModelDto = Joi.object({
  keyword: Joi.string().default(''),
  limit: Joi.number().min(10).max(100).default(10),
  page: Joi.number().min(1).default(1),
});
