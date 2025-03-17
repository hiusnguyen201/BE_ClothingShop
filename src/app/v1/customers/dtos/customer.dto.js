import Joi from 'joi';

export const CustomerDto = Joi.object({
  _id: Joi.string().required(),
  avatar: Joi.string().allow(null),
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  birthday: Joi.date().allow(null),
  gender: Joi.string().required(),
  status: Joi.string().required(),
  verifiedAt: Joi.date().allow(null),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
