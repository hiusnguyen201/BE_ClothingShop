import Joi from 'joi';

Joi.buffer = function () {
  return Joi.custom((value, helpers) => {
    if (!(value instanceof Buffer)) {
      return helpers.message('{{#label}} invalid file');
    }
    return value;
  });
};

export default Joi;
