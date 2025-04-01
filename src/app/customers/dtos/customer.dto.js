import Joi from 'joi';

export const CustomerDto = Joi.object({
  _id: Joi.string().required(),
  avatar: Joi.string().allow(null),
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().required(),
  verifiedAt: Joi.date().allow(null),
  lastLoginAt: Joi.date().allow(null),
});
