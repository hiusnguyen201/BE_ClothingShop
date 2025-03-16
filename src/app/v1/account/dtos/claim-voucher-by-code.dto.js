import Joi from 'joi';

export const ClaimVoucherByCodeDto = Joi.object({
  voucherCode: Joi.string().uppercase().required().length(9),
});
