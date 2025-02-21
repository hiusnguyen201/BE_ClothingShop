import Joi from 'joi';
import { GENDER } from '#core/constant';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export const createCustomerDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(30)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  birthday: Joi.date().iso(),
  gender: Joi.string()
    .required()
    .valid(...Object.values(GENDER)),
  phone: Joi.isPhoneNumber('+84').required(),
});
