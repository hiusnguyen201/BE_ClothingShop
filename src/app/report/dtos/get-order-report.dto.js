import Joi from 'joi';
import { DATE_COMPARES } from '#src/app/report/report.constant';

/**
 * @typedef {Object} GetOrderReportDto
 * @property {string} compareTo
 */
export const GetOrderReportDto = Joi.object({
  compareTo: Joi.string()
    .valid(...Object.values(DATE_COMPARES))
    .default(DATE_COMPARES.YESTERDAY),
});
