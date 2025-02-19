import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updateReviewFeedbackDto = Joi.object({
  comment: Joi.string()
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value))
});