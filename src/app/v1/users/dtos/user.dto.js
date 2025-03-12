import Joi from 'joi';

export const UserDto = Joi.object({
  _id: Joi.objectId(),
  avatar: Joi.string(),
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  gender: Joi.string().allow(null),
  isVerified: Joi.boolean(),
  verifiedAt: Joi.date(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});
