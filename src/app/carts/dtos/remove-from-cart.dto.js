import Joi from 'joi';
import { objectIdValidator } from '#src/utils/string.util';

export const RemoveFromCartDto = Joi.object({
  productVariantId: Joi.string().required().custom(objectIdValidator),
});
