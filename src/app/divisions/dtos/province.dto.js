import Joi from 'joi';

export const ProvinceDto = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  unit: Joi.string().required(),
});
