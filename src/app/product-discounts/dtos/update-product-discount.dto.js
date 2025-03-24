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
}).custom((value, helper) => {
  const start = new Date(value.start_date).getTime();
  const end = new Date(value.end_date).getTime();

  if (start > end) {
    return helper.message("Start date cannot be greater than end date")
  }
  return value;
});