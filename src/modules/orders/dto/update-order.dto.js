import Joi from "joi";
import { REGEX_PATTERNS } from "#src/core/constant";

export const updateOrderDto = Joi.object({
  customer_name: Joi.string().min(3).max(100),
  customer_phone: Joi.string().custom((value, helper) => {
    if (!value.match(REGEX_PATTERNS.PHONE_VIETNAM)) {
      return helper.message("Invalid vietnam phone number");
    }
    return value;
  }),
  shipping_address: Joi.string(),
  products: Joi.string(),
  status: Joi.string(),
});
