import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";
import { PRODUCT_STATUS } from "#src/core/constant";
import { createProductOptionDto } from "#src/modules/product_options/dto/create-product-options.dto";

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
    .items(createProductOptionDto)
});