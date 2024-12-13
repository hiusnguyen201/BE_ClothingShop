import Joi from "joi";
import moment from "moment-timezone";
export const updateVoucherDto = Joi.object({
  name: Joi.string().min(3).max(30),
  description: Joi.string(),
  maxUses: Joi.number(),
  endDate: Joi.date().iso().min(moment().valueOf()),
});
