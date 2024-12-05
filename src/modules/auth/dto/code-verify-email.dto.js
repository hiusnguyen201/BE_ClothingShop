import Joi from "joi";

export const verifyOtpDto = Joi.object({
  email: Joi.string().required().email(),
  code: Joi.string().required().length(6),
});