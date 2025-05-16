import Joi from 'joi';

/**
 * @typedef {Object} GetUserDto
 * @property {string} userId
 */
export const GetUserDto = Joi.object({
  userId: Joi.objectId().required(),
});
