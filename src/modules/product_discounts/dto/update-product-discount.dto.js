import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updateProductDiscountDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(150)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  amount: Joi.number(),
  is_fixed: Joi.boolean(),
  start_date: Joi.date()
    .iso(),
  end_date: Joi.date()
    .iso(),
  product: Joi.string(),
});