import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const UpdateRoleDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .min(3)
    .required()
    .max(255)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  isActive: Joi.boolean().required(),
});
