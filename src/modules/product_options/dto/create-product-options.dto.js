import Joi from "joi";

export const createProductOptionDto = Joi.object({
  // option_name: Joi.string().
  //   required(),
  value: Joi.object()
    .required(),

  product: Joi.string()
    .required(),
  option: Joi.string()
    .required(),
});