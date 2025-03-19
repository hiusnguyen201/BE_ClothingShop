import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { CATEGORY_STATUS } from '#src/app/categories/categories.constant';

export const UpdateCategoryDto = Joi.object({
  image: Joi.buffer(),
  name: Joi.string()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string().valid(...Object.values(CATEGORY_STATUS)),
})
  .min(1)
  .message('Update category must have at least 1 key');
