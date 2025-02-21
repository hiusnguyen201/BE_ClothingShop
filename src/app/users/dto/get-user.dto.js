import Joi from 'joi';

export const getUserDto = Joi.object({
  userId: Joi.string().required(),
});
