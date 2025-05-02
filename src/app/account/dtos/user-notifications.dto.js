import Joi from 'joi';

export const UserNotificationDto = Joi.object({
  _id: Joi.any(),
  user: Joi.any(),
  notification: Joi.any(),
  isRead: Joi.boolean().required(),
  readAt: Joi.date().allow(null),
  deliveredAt: Joi.date().required(),
});
