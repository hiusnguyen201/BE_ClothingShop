import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const checkExistProductNameDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  skipId: Joi.string(),
});
