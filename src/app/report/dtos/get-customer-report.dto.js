import Joi from 'joi';
import { DATE_COMPARES } from '#src/app/report/report.constant';

/**
 * @typedef {Object} GetCustomerReportDto
 * @property {string} compareTo
 */
export const GetCustomerReportDto = Joi.object({
  compareTo: Joi.string()
    .valid(...Object.values(DATE_COMPARES))
    .default(DATE_COMPARES.YESTERDAY),
});
