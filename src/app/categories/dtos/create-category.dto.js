import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { CATEGORY_STATUS } from '#src/app/categories/categories.constant';

export const CreateCategoryDto = Joi.object({
  image: Joi.binary().required(),
  name: Joi.string()
    .required()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string()
    .required()
    .valid(...Object.values(CATEGORY_STATUS)),
  parentId: Joi.string(),
});
