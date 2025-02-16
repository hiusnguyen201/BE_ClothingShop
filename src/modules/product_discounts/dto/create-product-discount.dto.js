import Joi from "joi";

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
  product: Joi.string()
    .required(),
});