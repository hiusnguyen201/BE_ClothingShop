import Joi from 'joi';

export const WardDto = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  unit: Joi.string().required(),
  full_name: Joi.string().required(),
});
