import Joi from "joi";

export const updateUserDto = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
});
