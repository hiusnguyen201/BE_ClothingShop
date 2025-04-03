import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createReviewFeedbackDto = Joi.object({
  comment: Joi.string()
    .max(255)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  review: Joi.string()
    .required(),
});