import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";
import { PRODUCT_STATUS } from "#src/core/constant";

const createOptionValueDto = Joi.object({
  name: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  images: Joi.array()
    .items(
      Joi.string()
        .max(300)
    )
});

const createProductOptionDto = Joi.object({
  option_name: Joi.string()
    .max(100)
    .required(),
  has_images: Joi.boolean()
    .required(),
  values: Joi.array()
    .required()
    .items(createOptionValueDto)
});

export const createProductDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  price: Joi.number()
    .required(),
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

  product_options: Joi.array()
    .required()
    .items(createProductOptionDto)
    .custom((value, helper) => {
      const count = value.filter(productOption => productOption.hasImages === true).length;
      if (count > 1) {
        return helper.message("Only allows 1 option have image");
      }
      return value;
    }),
});

