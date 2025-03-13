import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

Joi.objectId = function (overrideMessage) {
  return Joi.required().custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      helpers.error('any.invalid', { message: overrideMessage || 'Invalid ObjectId' });
    } else {
      return value;
    }
  });
};

export default Joi;
