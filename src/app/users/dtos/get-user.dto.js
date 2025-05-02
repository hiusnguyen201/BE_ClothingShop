import Joi from 'joi';

export const GetUserDto = Joi.object({
  userId: Joi.string().required(),
});
