import Joi from "joi";

export const createProductOptionImageDto = Joi.object({
  image: Joi.string()
    .min(3)
    .max(300)
    .required(),
  product: Joi.string()
    .required(),
});