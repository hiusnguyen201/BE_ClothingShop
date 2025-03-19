import Joi from 'joi';

export const CheckExistVoucherCodeDto = Joi.object({
  code: Joi.string().uppercase().required().length(9),
});
