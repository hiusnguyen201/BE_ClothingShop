import { ORDERS_STATUS } from '#src/app/orders/orders.constant';
import Joi from 'joi';

export const GetListOrderDto = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(10).max(500).default(10),
  sortBy: Joi.string().valid('createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string()
    .valid(...Object.values(ORDERS_STATUS))
    .optional(),
  customerId: Joi.string(),
});
