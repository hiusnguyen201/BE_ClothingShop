import Joi from 'joi';

export const UserDto = Joi.object({
  _id: Joi.string().required(),
  avatar: Joi.string().allow(null),
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().allow(null),
  verifiedAt: Joi.date().allow(null),
});
