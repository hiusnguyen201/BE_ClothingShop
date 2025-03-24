import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createProductReviewDto = Joi.object({
  comment: Joi.string()
    .max(255)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  score: Joi.number()
    .min(1)
    .max(5)
    .required(),
  product: Joi.string()
    .required(),
});