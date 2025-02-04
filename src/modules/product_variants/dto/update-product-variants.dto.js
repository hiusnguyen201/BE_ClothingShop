import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updateProductVariantDto = Joi.object({
  available: Joi.boolean(),
  quantity: Joi.number(),
  price: Joi.number(),
  option1: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  option2: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  product: Joi.string(),
});