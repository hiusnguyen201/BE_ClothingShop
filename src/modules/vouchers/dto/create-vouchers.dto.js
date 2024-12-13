import Joi from "joi";
import moment from "moment-timezone";

export const createVoucherDto = Joi.object({
  code: Joi.string().uppercase().required().length(9),
  name: Joi.string().required().min(3).max(30),
  description: Joi.string(),
  maxUses: Joi.number().required(),
  discount: Joi.number().required(),
  startDate: Joi.date().iso().required().min(moment().valueOf()),
  endDate: Joi.date().iso().required().greater(Joi.ref("startDate")),
  isFixed: Joi.boolean().required(),
});
