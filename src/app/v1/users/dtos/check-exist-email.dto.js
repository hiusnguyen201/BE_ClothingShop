import Joi from 'joi';

export const CheckExistEmailDto = Joi.object({
  email: Joi.string().email().required(),
});
