import Joi from "joi";
import { ALLOW_METHODS, REGEX_PATTERNS } from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createPermissionDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  module: Joi.string()
    .required()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  endpoint: Joi.string()
    .required()
    .min(3)
    .max(255)
    .custom((value, helper) => {
      if (!value.match(REGEX_PATTERNS.ENDPOINT)) {
        return helper.message("Invalid endpoint");
      }
      return value;
    }),
  method: Joi.string()
    .required()
    .valid(...ALLOW_METHODS),
  isActive: Joi.boolean().required(),
});
