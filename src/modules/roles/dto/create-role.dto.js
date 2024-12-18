import Joi from "joi";
import { ROLE_STATUS } from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createRoleDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string()
    .valid(...[ROLE_STATUS.ACTIVE, ROLE_STATUS.INACTIVE])
    .required(),
  permissions: Joi.array().items(Joi.string()),
});
