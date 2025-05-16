import Joi from 'joi';
import { replaceMultiSpacesToSingleSpace } from '#src/utils/string.util';

/**
 * @typedef {Object} CheckExistRoleNameDto
 * @property {string} name
 */
export const CheckExistRoleNameDto = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
});
