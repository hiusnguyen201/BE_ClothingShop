import Joi from 'joi';

export const updateOrderDto = Joi.object({
  customerEmail: Joi.string().email(),
  customerName: Joi.string().min(3).max(100),
  customerPhone: Joi.phoneNumber('VN'),
});
