import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const CreateRoleDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(50)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  description: Joi.string()
    .required()
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  isActive: Joi.boolean().required(),
});
