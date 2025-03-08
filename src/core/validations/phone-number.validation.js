import Joi from 'joi';
import { REGEX_PATTERNS } from '#core/constant';

Joi.phoneNumber = function (code, overrideMessage) {
  return Joi.custom((value, helpers) => {
    const pattern = REGEX_PATTERNS.PHONE_NUMBER[code];
    if (!pattern) {
      throw new Error(`Phone number with code \"${code}\" is not supported`);
    }

    if (!pattern.test(value)) {
      return helpers.error('any.invalid', { message: overrideMessage || 'Invalid phone number format' });
    }
    return value;
  });
};

export default Joi;
