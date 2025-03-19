import Joi from 'joi';

export const LoginDto = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});
