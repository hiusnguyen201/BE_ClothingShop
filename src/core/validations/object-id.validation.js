import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

Joi.objectId = function (overrideMessage) {
  return Joi.string().custom((value, helpers) => {
    if (isValidObjectId(value)) {
      return value;
    }

    return helpers.message(overrideMessage || `\"${helpers.state.path[0]}\" invalid`);
  });
};
