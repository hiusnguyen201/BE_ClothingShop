import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";
import { PRODUCT_STATUS } from "#src/core/constant";

const updateOptionValueDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  images: Joi.array()
    .items(Joi.string())
});

const updateProductOptionDto = Joi.object({
  option_name: Joi.string()
    .min(3)
    .max(100)
    .required(),
  hasImages: Joi.boolean()
    .required(),
  values: Joi.array()
    .required()
    .items(updateOptionValueDto)
});

export const updateProductDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  price: Joi.number(),
  short_description: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  content: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string()
    .valid(...PRODUCT_STATUS),
  is_hidden: Joi.boolean(),
  is_featured: Joi.boolean(),
  is_new: Joi.boolean(),
  category: Joi.string(),
  sub_category: Joi.string(),
  tags: Joi.array().items(Joi.string()),

  product_options: Joi.array()
    .items(updateProductOptionDto)
    .custom((value, helper) => {
      const count = value.filter(productOption => productOption.hasImages === true).length;
      if (count > 1) {
        return helper.message("Only allows 1 option have image");
      }
      return value;
    }),
});