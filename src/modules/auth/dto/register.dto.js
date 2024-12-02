import Joi from "joi";

export const registerDto = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(3).max(30),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
  phone: Joi.string(),
});
