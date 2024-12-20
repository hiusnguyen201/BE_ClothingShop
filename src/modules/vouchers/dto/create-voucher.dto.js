import Joi from "joi";
import moment from "moment-timezone";

export const createVoucherDto = Joi.object({
  code: Joi.string().uppercase().required().length(9),
  name: Joi.string().required().min(3).max(30),
  description: Joi.string(),
  maxUses: Joi.number().required(),
  maxUsesPerUser: Joi.number().required(),
  startDate: Joi.date().iso().required().min(moment().valueOf()),
  endDate: Joi.date().iso().required().greater(Joi.ref("startDate")),
  discount: Joi.number()
    .required()
    .custom((value, helpers) => {
      const { minPrice, isFixed } = helpers.state.ancestors[0];
      if (isFixed === "false") {
        if (value > 70) {
          return helpers.message(
            `Discount price cannot be less than 70% of minPrice`
          );
        }
      }
      if (value > 0.7 * minPrice) {
        return helpers.message(
          `Discount price cannot be less than 70% of minPrice`
        );
      }
      return value;
    }),

  minPrice: Joi.number().positive().required(),
  isPublic: Joi.boolean().required(),
  isFixed: Joi.boolean().required(),
  hasMaxDiscount: Joi.boolean().required(),
  maxDiscount: Joi.number()
    .required()
    .custom((value, helpers) => {
      const { isFixed, hasMaxDiscount } = helpers.state.ancestors[0];
      if (hasMaxDiscount === "false" || isFixed === "true")
        return undefined;
      if (value < 1000) {
        return helpers.message(`Minimum value is 1000`);
      }
      return value;
    }),
});
