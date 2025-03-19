import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createTagDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
});