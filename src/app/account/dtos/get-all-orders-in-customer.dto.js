import { ORDER_STATUS } from '#src/app/orders/orders.constant';
import Joi from 'joi';

export const GetAllOrdersInCustomerDto = Joi.object({
  customerId: Joi.string().required(),
  page: Joi.number()
    .min(1)
    .default(1)
    .custom((value) => +value),
  keyword: Joi.string()
    .default('')
    .allow('')
    .custom((val) => escapeStringRegexp(replaceMultiSpacesToSingleSpace(val))),
  limit: Joi.number().min(10).max(500).default(10),
  sortBy: Joi.string().valid('code', 'orderDate', 'total', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .optional(),
  minTotal: Joi.number().min(0),
  maxTotal: Joi.number().min(0),
});
