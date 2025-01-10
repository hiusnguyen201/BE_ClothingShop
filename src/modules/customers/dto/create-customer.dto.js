import Joi from "joi";
import { GENDER } from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const createCustomerDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(30)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string()
    .required()
    .valid(...Object.values(GENDER)),
  phone: Joi.string()
    .required()
    .custom((value, helper) =>
      value.match(
        REGEX_PATTERNS.PHONE_VIETNAM
          ? value
          : helper.message("Invalid vietnam phone number")
      )
    ),
});
