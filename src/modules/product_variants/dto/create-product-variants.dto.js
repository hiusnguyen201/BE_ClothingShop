import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createProductVariantDto = Joi.object({
  available: Joi.boolean()
    .required(),
  quantity: Joi.number()
    .required(),
  price: Joi.number()
    .required(),
  option1: Joi.string()
    .min(3)
    .max(255)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  option2: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  product: Joi.string()
    .required(),
});
