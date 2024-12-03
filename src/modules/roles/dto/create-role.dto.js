import Joi from "joi";

export const createRoleDto = Joi.object({
  name: Joi.string().required().min(3).max(50),
  description: Joi.string().min(3).max(255),
});