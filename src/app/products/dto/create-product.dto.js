import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";
import { PRODUCT_STATUS } from "#src/core/constant";

const createVariantValueDto = Joi.object({
  option: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  option_value: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value))
});

const createProductVariantDto = Joi.object({
  quantity: Joi.number()
    .required()
    .min(1),
  price: Joi.number()
    .required()
    .min(1000),
  sku: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  variant_values: Joi.array()
    .required()
    .items(createVariantValueDto)
    .custom((value, helper) => {
      const optionIds = [];
      value.map(item => {
        if (optionIds.includes(item.option)) {
          return helper.message("Duplicate option");
        }
        optionIds.push(item.option);
      })
      return value;
    })
});

export const CreateProductDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  // price: Joi.number()
  //   .required(),
  short_description: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  content: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string()
    .required()
    .valid(...PRODUCT_STATUS),
  is_hidden: Joi.boolean().required(),
  is_featured: Joi.boolean().required(),
  is_new: Joi.boolean().required(),
  category: Joi.string().required(),
  sub_category: Joi.string(),
  tags: Joi.array().items(Joi.string()),

  product_variants: Joi.array()
    .required()
    .items(createProductVariantDto)
});

