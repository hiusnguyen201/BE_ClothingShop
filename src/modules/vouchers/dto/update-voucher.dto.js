import Joi from "joi";
import moment from "moment-timezone";
export const updateVoucherDto = Joi.object({
  name: Joi.string().min(3).max(30),
  description: Joi.string(),
  isPublic: Joi.boolean(),
  endDate: Joi.date().iso().min(moment().valueOf()),
  maxUses: Joi.number(),
}).min(1);
