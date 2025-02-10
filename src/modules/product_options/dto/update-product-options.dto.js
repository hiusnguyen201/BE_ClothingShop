import Joi from "joi";

export const updateProductOptionDto = Joi.object({
  value: Joi.object(),
  product: Joi.string(),
  option: Joi.string()
});