import Joi from 'joi';

export const sendOtpViaEmailDto = Joi.object({
  email: Joi.string().required().email(),
});

export const verifyOtpDto = Joi.object({
  email: Joi.string().required().email(),
  otp: Joi.string().required().length(6),
});
