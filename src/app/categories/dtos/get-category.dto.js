import Joi from 'joi';

export const GetCategoryDto = Joi.object({
  categoryId: Joi.string().required(),
});
