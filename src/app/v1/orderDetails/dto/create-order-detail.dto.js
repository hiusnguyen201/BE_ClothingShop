import Joi from "joi";
import mongoose from "mongoose";

export const createOrderDetailDto = Joi.object({
  orderId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }),
  productId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }),
  quantity: Joi.number().required().positive(),
  discount: Joi.number().positive(),
});
