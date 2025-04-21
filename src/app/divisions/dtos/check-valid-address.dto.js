import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import Joi from 'joi';

export const CheckValidAddressDto = Joi.object({
  address: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
});
