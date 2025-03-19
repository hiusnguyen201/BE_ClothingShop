import Joi from 'joi';

export const ChangePasswordDto = Joi.object({
  password: Joi.string().required(),
  newPassword: Joi.string().required().min(3).max(30).trim(),
  confirmNewPassword: Joi.string().required().equal(Joi.ref('newPassword')).messages({
    'any.only': `\"confirmNewPassword\" do not match newPassword`,
  }),
});
