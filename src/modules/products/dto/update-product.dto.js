import Joi from "joi";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";
import { PRODUCT_STATUS } from "#src/core/constant";

const createOptionSizeDto = Joi.object({
  name: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  quantity: Joi.number()
    .min(0)
    .required(),
  price: Joi.number()
    .required()
});

const createProductOptionDto = Joi.object({
  color: Joi.string()
    .max(100)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  image: Joi.string()
    .max(300),
  option_sizes: Joi.array()
    .required()
    .items(createOptionSizeDto)
});

const updateOptionSizeDto = Joi.object({
  _id: Joi.string()
    .required(),
  name: Joi.string()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  quantity: Joi.number()
    .min(0),
  price: Joi.number()
});

const updateProductOptionDto = Joi.object({
  _id: Joi.string()
    .required(),
  color: Joi.string()
    .max(100)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  image: Joi.string()
    .max(300),
  option_sizes: Joi.array()
    .items(updateOptionSizeDto)
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
  tags_to_delete: Joi.array().items(Joi.string()),

  product_options: Joi.array()
    .items(createProductOptionDto),

  // update_data: Joi.array()
  //   .items(Joi.object({
  //     product_options: Joi.array()
  //       .items(updateProductOptionDto),
  //     option_sizes: Joi.array()
  //       .items(updateOptionSizeDto)
  //   }))
  update_product_options: Joi.array()
    .items(updateProductOptionDto),
  detele_product_options: Joi.array()
    .items(Joi.string()),
  delete_option_sizes: Joi.array()
    .items(Joi.object({
      product_option_id: Joi.string(),
      option_sizes: Joi.array()
        .items(Joi.string())
    })),
});