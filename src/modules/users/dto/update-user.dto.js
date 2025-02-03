import Joi from "joi";
import { GENDER, REGEX_PATTERNS } from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updateUserDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  role: Joi.string(),
  phone: Joi.string().custom((value, helper) => {
    if (!value.match(REGEX_PATTERNS.PHONE_VIETNAM)) {
      return helper.message("Invalid vietnam phone number");
    }
    return value;
  }),
});
