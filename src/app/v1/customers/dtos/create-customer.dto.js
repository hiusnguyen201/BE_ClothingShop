import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';
import { GENDER } from '#src/app/v1/users/users.constant';

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
  phone: Joi.phoneNumber('VN').required(),
});
