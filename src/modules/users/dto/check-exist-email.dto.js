import Joi from "joi";

export const checkExistEmailDto = Joi.object({
  email: Joi.string().email(),
});
