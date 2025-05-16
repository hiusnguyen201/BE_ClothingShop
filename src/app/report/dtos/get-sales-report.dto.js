import Joi from 'joi';
import { SALE_TYPES } from '#src/app/report/report.constant';

/**
 * @typedef {Object} GetSalesReportDto
 * @property {string} type
 */
export const GetSalesReportDto = Joi.object({
  type: Joi.string()
    .valid(...Object.values(SALE_TYPES))
    .default(SALE_TYPES.LAST_24_HOURS),
});
