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
  description: Joi.string().required(),
  category: Joi.string().required(),
  subCategory: Joi.string().allow(null),
  status: Joi.string()
    .valid(...Object.values(PRODUCT_STATUS))
    .required(),
});
