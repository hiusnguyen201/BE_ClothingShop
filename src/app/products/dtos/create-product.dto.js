import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

const createVariantValueDto = Joi.object({
  option: Joi.string()
    .required(),
  optionValue: Joi.string()
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
  variantValues: Joi.array()
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

export const CreateProductDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  shortDescription: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  content: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  category: Joi.string().required(),
  subCategory: Joi.string(),

  productVariants: Joi.array()
    .required()
    .min(1)
    .items(createProductVariantDto)
    .custom((value, helper) => {
      const length = value[0].variantValues.length;

      for (const variant of value) {
        if (variant.variantValues.length != length) {
          return helper.message("Variant value length not match")
        }
      }
      return value;
    })
});

