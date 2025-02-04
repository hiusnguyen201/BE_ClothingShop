import Joi from "joi";

export const createProductTagsDto = Joi.object({
  product: Joi.string()
    .required(),
  tags: Joi.array()
    .items(Joi.string())
    .required(),
});