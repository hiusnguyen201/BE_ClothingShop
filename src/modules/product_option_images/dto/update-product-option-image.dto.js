import Joi from "joi";

export const updateProductOptionImageDto = Joi.object({
  image: Joi.string()
    .min(3)
    .max(300),
  product: Joi.string()
});