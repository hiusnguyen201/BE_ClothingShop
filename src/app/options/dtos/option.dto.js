import Joi from 'joi';

const OptionValueDto = Joi.object({
  _id: Joi.any().required(),
  valueName: Joi.string().required(),
});

export const OptionDto = Joi.object({
  _id: Joi.any().required(),
  name: Joi.string().required(),
  optionValues: Joi.array().items(OptionValueDto).required(),
});
