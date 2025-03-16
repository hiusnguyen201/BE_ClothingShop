import Joi from 'joi';

export const ForgotPasswordDto = Joi.object({
  email: Joi.string().required().email(),
  callbackUrl: Joi.string().required().uri(),
});

export const ResetPasswordDto = Joi.object({
  password: Joi.string().required().min(3).max(30),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')),
});
