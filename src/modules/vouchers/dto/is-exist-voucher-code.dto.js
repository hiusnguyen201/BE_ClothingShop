import Joi from "joi";

export const isExistVoucherCodeDto = Joi.object({
  code: Joi.string().uppercase().required().length(9),
});
