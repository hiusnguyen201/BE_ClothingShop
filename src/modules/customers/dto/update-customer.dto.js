import Joi from "joi";
import { GENDER } from "#src/core/constant";

export const updateCustomersDto = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string().valid(...Object.values(GENDER))
});
