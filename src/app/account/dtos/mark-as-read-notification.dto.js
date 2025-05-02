import Joi from 'joi';

export const MarkAsReadNotificationDto = Joi.object({
  userNotificationId: Joi.string().required(),
});
