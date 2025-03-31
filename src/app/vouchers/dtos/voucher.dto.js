import Joi from 'joi';

export const VoucherDto = Joi.object({
  _id: Joi.string(),
  code: Joi.string(),
  name: Joi.string(),
  description: Joi.string(),
  maxUses: Joi.number(),
  maxUsesPerUser: Joi.number(),
  discount: Joi.number(),
  isFixed: Joi.boolean(),
  isPublic: Joi.boolean(),
  maxDiscount: Joi.number(),
  hasMaxDiscount: Joi.boolean(),
  minPrice: Joi.number(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  uses: Joi.number(),
});
