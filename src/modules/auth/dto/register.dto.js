import Joi from "joi";

export const registerDto = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(3).max(30),
  name: Joi.string().required(),
  phone: Joi.string().required(),
});