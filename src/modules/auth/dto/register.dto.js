import { REGEX_PATTERNS } from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";
import Joi from "joi";

export const registerDto = Joi.object({
  name: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(3).max(30),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
  phone: Joi.string()
    .required()
    .custom((value, helper) => {
      value.match(
        REGEX_PATTERNS.PHONE_VIETNAM
          ? value
          : helper.message("Invalid vietnam phone number")
      );
    }),
});
