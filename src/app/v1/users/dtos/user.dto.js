import Joi from 'joi';

export const UserDto = Joi.object({
  _id: Joi.objectId(),
  avatar: Joi.string().allow(null),
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().allow(null),
  status: Joi.string().required(),
  isVerified: Joi.boolean().required(),
  verifiedAt: Joi.date().allow(null),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
