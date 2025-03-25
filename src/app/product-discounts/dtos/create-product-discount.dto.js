import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createProductDiscountDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(150)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  amount: Joi.number()
    .required(),
  is_fixed: Joi.boolean()
    .required(),
  start_date: Joi.date()
    .iso()
    .required(),
  end_date: Joi.date()
    .iso()
    .required(),
  productVariant: Joi.string()
    .required(),
}).custom((value, helper) => {
  const start = new Date(value.start_date).getTime();
  const end = new Date(value.end_date).getTime();

  if (start > end) {
    return helper.message("Start date cannot be greater than end date")
  }
  return value;
});