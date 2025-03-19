import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { ROLE_STATUS } from '#src/app/roles/roles.constant';

export const CreateRoleDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string()
    .required()
    .valid(...Object.values(ROLE_STATUS)),
});
