import Joi from "joi";
import moment from "moment-timezone";
export const updateVoucherDto = Joi.object({
  name: Joi.string().min(3).max(30),
  description: Joi.string(),
  isPublic: Joi.boolean(),
  maxDiscount: Joi.number().min(0).max(100),
  minPrice: Joi.number(),
  maxUses: Joi.number(),
  endDate: Joi.date().iso().min(moment().valueOf()),
}).min(1);
