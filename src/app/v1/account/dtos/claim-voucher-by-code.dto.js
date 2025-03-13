import Joi from "joi";

export const claimVoucherByCodeDto = Joi.object({
  voucherCode: Joi.string().uppercase().required().length(9),
});
