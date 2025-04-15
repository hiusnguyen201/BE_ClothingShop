import Joi from 'joi';
import { objectIdValidator } from '#src/utils/string.util';

export const AddToCartDto = Joi.object({
  productVariantId: Joi.string()
    .required()
    .custom(objectIdValidator),
  quantity: Joi.number()
    .min(1)
    .required(),
});