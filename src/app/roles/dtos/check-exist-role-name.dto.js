import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

export const CheckExistRoleNameDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
});
