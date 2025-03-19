import Joi from 'joi';

export const UserAuthDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().required(),
});
