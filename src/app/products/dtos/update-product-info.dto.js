import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { PRODUCT_STATUS } from '#src/app/products/products.constant';

export const updateProductInfoDto = Joi.object({
  thumbnail: Joi.alternatives(Joi.binary().strict(), Joi.string().strict()).required(),
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .min(30)
    .max(3000)
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),

  category: Joi.string().required(),
  subCategory: Joi.string().required().allow(null),
  status: Joi.string()
    .valid(...Object.values(PRODUCT_STATUS))
    .required(),

  // import { createProductVariantDto } from '#src/app/products/dtos/create-product-variant.dto';

  // productVariants: Joi.array()
  //   .items(createProductVariantDto)
  //   .required()
  //   .min(1)
  //   .custom((value, helper) => {
  //     const length = value[0].variantValues.length;

  //     for (const variant of value) {
  //       if (variant.variantValues.length !== length) {
  //         return helper.message('Variant value length not match');
  //       }
  //     }

  //     return value;
  //   }),
});
