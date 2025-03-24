import Joi from 'joi';

export const ReviewFeedbackDto = Joi.object({
  _id: Joi.string().required(),
  comment: Joi.string().required(),
  review: Joi.string().required(),
  user: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
