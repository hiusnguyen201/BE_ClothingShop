import Joi from "joi";
import { ROLE_STATUS } from "#src/core/constant";

export const updateRoleDto = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().min(3).max(255),
  status: Joi.string().valid(...Object.values(ROLE_STATUS)),
  permissions: Joi.array().items(Joi.string()),
});
