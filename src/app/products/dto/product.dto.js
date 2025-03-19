import Joi from 'joi';

export const ProductDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  short_description: Joi.string(),
  gender: Joi.string().allow(null),
  status: Joi.string().required(),
  verifiedAt: Joi.date().allow(null),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
