import Joi from "joi";
import { ALLOW_METHODS, PERMISSION_STATUS } from '#src/core/constant'

export const createPermissionDto = Joi.object({
  name: Joi.string().required().min(3).max(50),
  description: Joi.string().min(3).max(255),
  module: Joi.string().required().min(3).max(50),
  endpoint: Joi.string().required().min(3).max(255),
  method: Joi.string().required().valid(...ALLOW_METHODS),
  status: Joi.string().required().valid(...Object.values(PERMISSION_STATUS)),
});