import Joi from "joi";
import {
  ALLOW_METHODS,
  PERMISSION_STATUS,
  REGEX_PATTERNS,
} from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updatePermissionDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  module: Joi.string()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  endpoint: Joi.string()
    .min(3)
    .max(255)
    .custom((value, helper) => {
      if (REGEX_PATTERNS.ENDPOINT.test(value)) {
        return value;
      }
      return helper.message("Invalid endpoint");
    }),
  method: Joi.string().valid(...ALLOW_METHODS),
  status: Joi.string().valid(
    ...[PERMISSION_STATUS.ACTIVE, PERMISSION_STATUS.INACTIVE]
  ),
}).min(1);
