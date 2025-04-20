import Joi from 'joi';

export const WardDto = Joi.object({
  WardCode: Joi.string().required(),
  WardName: Joi.string().required(),
});
