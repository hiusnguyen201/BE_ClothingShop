import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { GENDER } from '#src/app/users/users.constant';

export const UpdateCustomerDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(30)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  email: Joi.string().required().email(),
  phone: Joi.phoneNumber('VN').required(),
  gender: Joi.string()
    .required()
    .valid(...Object.values(GENDER)),
})
  .min(1)
  .message('Update customer must have at least 1 key');
