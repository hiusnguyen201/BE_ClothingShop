'use strict';
import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';

Joi.phoneNumber = function (code, overrideMessage) {
  return Joi.custom((value, helpers) => {
    const pattern = REGEX_PATTERNS.PHONE_NUMBER[code];
    if (!pattern) {
      throw HttpException.new({
        code: Code.REGION_PHONE_NOT_SUPPORT,
        overrideMessage: `Phone number with code \"${code}\" is not supported`,
      });
    }

    const isValid = value.match(pattern);
    if (!isValid) {
      return helpers.message(
        overrideMessage || `\"${helpers.state.path[0]}\" invalid phone number format with code ${code}`,
      );
    }

    return value;
  });
};

export default Joi;
