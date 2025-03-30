import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const CreateCategoryDto = Joi.object({
  image: Joi.binary().required(),
  name: Joi.string()
    .required()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  parentId: Joi.string(),
});
