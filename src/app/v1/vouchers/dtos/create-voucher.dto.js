import Joi from 'joi';
import moment from 'moment-timezone';

export const CreateVoucherDto = Joi.object({
  code: Joi.string().uppercase().required().length(9),
  name: Joi.string().required().min(3).max(30),
  description: Joi.string(),
  maxUses: Joi.number().required(),
  maxUsesPerUser: Joi.number().required(),
  startDate: Joi.date().iso().required().min(moment().valueOf()),
  endDate: Joi.date().iso().required().greater(Joi.ref('startDate')),
  discount: Joi.number()
    .required()
    .custom((value, helper) => {
      const { minPrice, isFixed } = helper.state.ancestors[0];
      if (isFixed === 'false') {
        if (value > 70) {
          return helper.message(`Discount price cannot be less than 70% of minPrice`);
        }
      }
      if (value > 0.7 * minPrice) {
        return helper.message(`Discount price cannot be less than 70% of minPrice`);
      }
      return value;
    }),

  minPrice: Joi.number().positive().required(),
  isPublic: Joi.boolean().required(),
  isFixed: Joi.boolean().required(),
  hasMaxDiscount: Joi.boolean().required(),
  maxDiscount: Joi.number()
    .required()
    .custom((value, helper) => {
      const { isFixed, hasMaxDiscount } = helper.state.ancestors[0];
      if (hasMaxDiscount === 'false' || isFixed === 'true') return undefined;
      if (value < 1000) {
        return helper.message(`Minimum value is 1000`);
      }
      return value;
    }),
});
