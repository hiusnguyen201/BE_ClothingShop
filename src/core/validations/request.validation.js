'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';

/**
 * Ref: https://joi.dev/api - any.validate(value, [options])
 */
const options = {
  abortEarly: false, // when true, stops validation on the first error, otherwise returns all the errors found. Defaults to true.
  allowUnknown: true, //  when true, allows object to contain unknown keys which are ignored. Defaults to false.
  stripUnknown: true, //  when true, ignores unknown keys with a function value. Defaults to false.
};

const validateSchema = (schema, payloadPath = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[payloadPath], options);
    if (error) {
      const details = error.details.map((item) => ({
        path: item.path[0],
        message: item.message,
      }));
      return next(
        HttpException.new({ code: Code.INVALID_DATA, overrideMessage: 'Request validation error', data: details }),
      );
    }

    req[payloadPath] = value;
    return next();
  };
};

export const validateBody = (schema) => validateSchema(schema, 'body');

export const validateParams = (schema) => validateSchema(schema, 'params');

export const validateQuery = (schema) => validateSchema(schema, 'query');

export const validateFile = (multerUpload) => {
  return (req, res, next) => {
    multerUpload(req, res, (err) => {
      if (!err) {
        return next();
      }

      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(HttpException.new({ code: Code.FILE_TOO_LARGE }));
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return next(HttpException.new({ code: Code.TOO_MANY_OPEN_FILES }));
      } else {
        return next(HttpException.new({ code: Code.BAD_FILE_TYPE }));
      }
    });
  };
};
