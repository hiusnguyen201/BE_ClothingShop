import Joi from "joi";

export const createProductOptionDto = Joi.object({
  option_name: Joi.string()
    .min(3)
    .max(100)
    .required(),
  hasImages: Joi.boolean()
    .required(),
  values: Joi.array()
    .required()
    .items(
      Joi.object({
        value: Joi.string()
          .max(50)
          .required(),
        images: Joi.array()
          .items(Joi.string())
      }))

});