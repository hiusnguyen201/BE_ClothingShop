import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updateProductReviewDto = Joi.object({
  comment: Joi.string()
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  score: Joi.number()
    .min(1)
    .max(5),
});