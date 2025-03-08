import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export const checkExistCategoryNameDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
});
