import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const CheckExistCategoryNameDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
});
