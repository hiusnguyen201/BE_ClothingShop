import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';
import mongoose from 'mongoose';

export const updateOrderDto = Joi.object({
  customerEmail: Joi.string().email(),
  customerName: Joi.string().min(3).max(100),
  customerPhone: Joi.string().custom((value, helper) => {
    if (!value.match(REGEX_PATTERNS.PHONE_VIETNAM)) {
      return helper.message('Invalid vietnam phone number');
    }
    return value;
  }),
});
