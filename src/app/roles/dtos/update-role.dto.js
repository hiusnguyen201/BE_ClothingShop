import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';
import { ROLE_STATUS } from '#src/app/roles/roles.constant';

export const UpdateRoleDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .min(3)
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string().valid(...Object.values(ROLE_STATUS)),
})
  .min(1)
  .message('Update role must have at least 1 key');
