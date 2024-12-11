import Joi from "joi";
import { ROLE_STATUS } from "#src/core/constant";

export const createRoleDto = Joi.object({
  name: Joi.string().required().min(3).max(50),
  description: Joi.string().min(3).max(255),
  status: Joi.string().valid(...Object.values(ROLE_STATUS)).required(),
  permissions: Joi.array().items(Joi.string())
});
