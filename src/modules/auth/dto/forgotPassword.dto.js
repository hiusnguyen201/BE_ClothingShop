import Joi from "joi";

export const forgotPasswordDto = Joi.object({
  email: Joi.string().required().email(),
});
export const resetPasswordDto = Joi.object({
  password: Joi.string().required().min(3).max(30),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
});