import {
  BadRequestException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '#src/core/exception/http-exception';

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
      const message = error.details.map((item) => item.message);
      return next(new BadRequestException('Request validation error', message));
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
        return next(new PayloadTooLargeException('File too large'));
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new BadRequestException('Too many files'));
      } else {
        return next(new UnsupportedMediaTypeException('Invalid file type'));
      }
    });
  };
};
