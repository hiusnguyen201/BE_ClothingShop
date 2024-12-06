import Joi from "joi";
import { ALLOW_METHODS, PERMISSION_STATUS } from "#src/core/constant";

export const updatePermissionDto = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().min(3).max(255),
  module: Joi.string().min(3).max(50),
  endpoint: Joi.string().min(3).max(255),
  method: Joi.string().valid(...ALLOW_METHODS),
  status: Joi.string().valid(...Object.values(PERMISSION_STATUS)),
});
