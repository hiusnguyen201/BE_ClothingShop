import Joi from "joi";
import { GENDER, REGEX_PATTERNS } from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createUserDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  role: Joi.string(),
  phone: Joi.string().custom((value, helper) =>
    value.match(REGEX_PATTERNS.PHONE_VIETNAM)
      ? value
      : helper.message("Invalid vietnam phone number")
  ),
});
