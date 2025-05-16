import { ONLINE_PAYMENT_METHOD } from '#src/app/payments/payments.constant';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import Joi from 'joi';

/**
 * @typedef {Object} CreateOrderDto
 * @property {string} customerId
 * @property {string} customerName
 * @property {string} customerEmail
 * @property {string} customerPhone
 * @property {number} districtId
 * @property {number} provinceId
 * @property {string} wardCode
 * @property {string} address
 * @property {Array<OrderItem>} productVariants
 * @property {string} paymentMethod
 * @property {string} [notes]
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} id
 * @property {number} quantity
 */
export const CreateOrderDto = Joi.object({
  customerId: Joi.string().required(),
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),

  districtId: Joi.number().required(),
  provinceId: Joi.number().required(),
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
