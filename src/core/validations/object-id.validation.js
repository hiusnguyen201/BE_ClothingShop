import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

Joi.objectId = function (overrideMessage) {
  return Joi.custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.error('any.invalid', { message: overrideMessage || 'Invalid ObjectId' });
    }
    return value;
  });
};

export default Joi;
