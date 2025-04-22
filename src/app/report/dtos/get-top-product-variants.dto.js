import Joi from 'joi';

export const GetTopProductVariantsDto = Joi.object({
  limit: Joi.number().default(5).allow(5, 10),
});
