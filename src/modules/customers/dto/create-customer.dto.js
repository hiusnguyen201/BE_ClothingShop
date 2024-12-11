import Joi from "joi";
import { GENDER } from "#src/core/constant";


export const createCustomerDto = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(3).max(30),
  birthday: Joi.date().iso(),
  gender: Joi.string().required().valid(...Object.values(GENDER)),
})