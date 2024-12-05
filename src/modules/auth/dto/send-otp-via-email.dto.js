import Joi from "joi";

export const sendOtpViaEmailDto = Joi.object({
  email: Joi.string().required().email(),
});
