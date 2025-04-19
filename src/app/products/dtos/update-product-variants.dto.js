import Joi from 'joi';

const createVariantValueDto = Joi.object({
  option: Joi.string().required(),
  optionValue: Joi.string().required(),
});

const createProductVariantDto = Joi.object({
  quantity: Joi.number().required(),
  price: Joi.number().required().min(1000),
  sku: Joi.string().min(8).max(16).allow(''),
  variantValues: Joi.array() // màu gì, size gì
    .required()
    .items(createVariantValueDto)
    .required()
    .min(1)
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

const selectedOptionDto = Joi.object({
  option: Joi.string().required(),
  selectedValues: Joi.array().items(Joi.string().required()).min(1).required(),
});

export const updateProductVariantsDto = Joi.object({
  options: Joi.array().items(selectedOptionDto).min(1).required(),
  productVariants: Joi.array()
    .items(createProductVariantDto)
    .required()
    .min(1)
    .custom((value, helper) => {
      const length = value[0].variantValues.length;

      for (const variant of value) {
        if (variant.variantValues.length !== length) {
          return helper.message('Variant value length not match');
        }
      }

      return value;
    }),
});
