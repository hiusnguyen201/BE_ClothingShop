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
  isFixed: Joi.boolean()
    .required(),
  startDate: Joi.date()
    .iso()
    .required(),
  endDate: Joi.date()
    .iso()
    .required(),
  productVariant: Joi.string()
    .required(),
}).custom((value, helper) => {
  const start = new Date(value.startDate).getTime();
  const end = new Date(value.endDate).getTime();

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