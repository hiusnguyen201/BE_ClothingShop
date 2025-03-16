import Joi from 'joi';

export const SendOtpViaEmailDto = Joi.object({
  email: Joi.string().required().email(),
});

export const VerifyOtpDto = Joi.object({
  userId: Joi.string().required(),
  otp: Joi.string().required().length(6),
});
