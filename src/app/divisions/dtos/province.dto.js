import Joi from 'joi';

export const ProvinceDto = Joi.object({
  ProvinceID: Joi.number().required(),
  ProvinceName: Joi.string().required(),
});
