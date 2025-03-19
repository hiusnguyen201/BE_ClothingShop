import Joi from "joi";
import mongoose from "mongoose";

export const createPaymentDto = Joi.object({
  orderId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }),
  paymentMethod: Joi.string().required(),
});
