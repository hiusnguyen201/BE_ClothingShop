import { OFFLINE_PAYMENT_METHOD, ONLINE_PAYMENT_METHOD, PAYMENT_TYPE } from '#src/app/payments/payments.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import Joi from 'joi';

export const createOrderDto = Joi.object({
  customerId: Joi.string().required(),
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),

  districtCode: Joi.string().required(),
  provinceCode: Joi.string().required(),
  wardCode: Joi.string().required(),
  address: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),

  productVariants: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),

  paymentMethod: Joi.string()
    .required()
    .valid(...Object.values(ONLINE_PAYMENT_METHOD)),

  notes: Joi.string(),
});
