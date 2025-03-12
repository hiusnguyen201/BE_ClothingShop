import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';
import { UserConstant } from '#app/v2/users/UserConstant';

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
    .valid(...Object.values(UserConstant.GENDER)),
  phone: Joi.phoneNumber('VN').required(),
});
