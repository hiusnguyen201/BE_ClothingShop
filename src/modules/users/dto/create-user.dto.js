import Joi from "joi";

export const createUserDto = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string().required().email(),
});
