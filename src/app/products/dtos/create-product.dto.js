import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import sanitizeHtml from 'sanitize-html';

export const CreateProductDto = Joi.object({
  thumbnail: Joi.binary().required(),
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .required()
    .custom((value) => sanitizeHtml(value)),
  category: Joi.string().required(),
  subCategory: Joi.string().allow(null),
});
