import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

const createVariantValueDto = Joi.object({
  option: Joi.string()
    .required(),
  option_value: Joi.string()
    .required()
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
      const optionIds = new Set();

      for (let item of value) {
        if (optionIds.has(item.option)) {
          return helper.message("Duplicate option");
        }
        optionIds.add(item.option);
      }

      return value;
    })
});

const updateProductVariantDto = Joi.object({
  _id: Joi.string()
    .required(),
  quantity: Joi.number()
    .min(1),
  price: Joi.number()
    .min(1000),
  sku: Joi.string()
    .min(3)
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
});

export const updateProductDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
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
  category: Joi.string(),
  sub_category: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  tagsToDelete: Joi.array().items(Joi.string()),

  product_variants: Joi.array()
    .items(createProductVariantDto),

  productVariantsToUpdate: Joi.array()
    .items(updateProductVariantDto),

  productVariantsToDelete: Joi.array()
    .items(Joi.string())
});

