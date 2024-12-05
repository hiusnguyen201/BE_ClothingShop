import Joi from "joi";

export const verifiEmailDto = Joi.object({
  code: Joi.string().required().min(6).max(6),
});