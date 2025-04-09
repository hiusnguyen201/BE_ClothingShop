import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const CreateProductDto = Joi.object({
  thumbnail: Joi.binary().required(),
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .min(30)
    .max(3000)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),

  category: Joi.string().required(),
  subCategory: Joi.string().allow(null),
});
