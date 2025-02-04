import Joi from "joi";

export const deleteProductTagsDto = Joi.object({
  tags: Joi.array()
    .items(Joi.string())
    .required(),
});