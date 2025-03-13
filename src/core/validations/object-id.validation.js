import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

Joi.objectId = function (overrideMessage) {
  return Joi.required().custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.message(overrideMessage || `\"${helpers.state.path[0]}\" must be an ObjectId`);
    }
    return value;
  });
};

export default Joi;
