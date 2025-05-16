import Joi from 'joi';
import { VALID_ORDER_STATUS_WEBHOOK } from '#src/app/orders/orders.constant';

/**
 * @typedef {Object} WebHookOrderStatusDto
 * @property {string} status
 * @property {string} orderId
 */
export const WebHookOrderStatusDto = Joi.object({
  status: Joi.string()
    .required()
    .valid(...VALID_ORDER_STATUS_WEBHOOK),
  orderId: Joi.string().required(),
});
