import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const UpdateCategoryDto = Joi.object({
  image: Joi.alternatives().try(Joi.binary().strict(), Joi.string().strict()),
  name: Joi.string()
    .required()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
})
  .min(1)
  .message('Update category must have at least 1 key');
