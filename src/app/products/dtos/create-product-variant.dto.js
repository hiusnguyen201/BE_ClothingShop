import Joi from 'joi';

export const createVariantValueDto = Joi.object({
  option: Joi.string().required(),
  optionValue: Joi.string().required(),
});

export const createProductVariantDto = Joi.object({
  quantity: Joi.number().required().min(1),
  price: Joi.number().required().min(1000),
  sku: Joi.string().min(8).max(16).required(),
  variantValues: Joi.array() // màu gì, size gì
    .required()
    .items(createVariantValueDto)
    .custom((value, helper) => {
      const optionIds = new Set();

      for (let item of value) {
        if (optionIds.has(item.option)) {
          return helper.message('Duplicate option');
        }
        optionIds.add(item.option);
      }

      return value;
    }),
});
