import Joi from 'joi';

export const ReturnPaymentMoMoDto = Joi.object({
  orderId: Joi.string().required(),
  resultCode: Joi.string().required(),
  amount: Joi.string().required(),
  transId: Joi.string().required(),
  responseTime: Joi.string().required(),
});
