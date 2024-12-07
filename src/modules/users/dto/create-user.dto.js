import Joi from "joi";
import { GENDER } from "#src/core/constant";

export const createUserDto = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string().required().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string().valid(...Object.values(GENDER)),
});
