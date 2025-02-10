import Joi from "joi";

export const updateProductDiscountDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  amount: Joi.number(),
  is_fixed: Joi.boolean(),
  start_date: Joi.date()
    .iso(),
  end_date: Joi.date()
    .iso(),
  product: Joi.string(),
});