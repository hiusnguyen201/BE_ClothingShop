import { PAYMENT_METHOD } from '#src/core/constant';
import Joi from 'joi';
import mongoose from 'mongoose';

export const createPaymentDto = Joi.object({
  orderId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  paymentMethod: Joi.string()
    .valid(...Object.values(PAYMENT_METHOD))
    .required()
});
