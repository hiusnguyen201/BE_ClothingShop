import Joi from 'joi';

export const UserDto = Joi.object({
  _id: Joi.any().required(),
  avatar: Joi.string().allow(null),
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().allow(null),
  role: Joi.any(),
  verifiedAt: Joi.date().allow(null),
  lastLoginAt: Joi.date().allow(null),
});
