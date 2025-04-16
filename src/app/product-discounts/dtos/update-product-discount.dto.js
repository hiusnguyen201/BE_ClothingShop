import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updateProductDiscountDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(150)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  amount: Joi.number(),
  isFixed: Joi.boolean(),
  startDate: Joi.date()
    .iso(),
  endDate: Joi.date()
    .iso(),
}).custom((value, helper) => {
  const start = new Date(value.start_date).getTime();
  const end = new Date(value.end_date).getTime();

  if (start > end) {
    return helper.message("Start date cannot be greater than end date")
  }
  if (value.isFixed) {
    if (value.amount < 1 || value.amount > 99) {
      return helper.message("Discounts ranging from 1 to 99 percent")
    } else if (value.amount <= 1000) {
      return helper.message("Discount amount must greater than 1000")
    }
  }
  return value;
});