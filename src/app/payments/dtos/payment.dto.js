import Joi from 'joi';

export const PaymentDto = Joi.object({
  _id: Joi.any().required(),
  paymentMethod: Joi.string().required(),
  qrCodeUrl: Joi.string().allow(null),
  paymentUrl: Joi.string().allow(null),
  amountPaid: Joi.number().allow(null),
  paidDate: Joi.date().iso().allow(null),
  transactionId: Joi.string(),
  notes: Joi.string().allow(null),
  order: Joi.any().required(),
  status: Joi.string().required(),
});
