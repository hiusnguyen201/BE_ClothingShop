import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const UpdateCategoryDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  isHide: Joi.boolean(),
});
