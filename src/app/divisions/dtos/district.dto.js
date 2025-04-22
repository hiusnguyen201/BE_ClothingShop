import Joi from 'joi';

export const DistrictDto = Joi.object({
  DistrictID: Joi.number().required(),
  DistrictName: Joi.string().required(),
});
