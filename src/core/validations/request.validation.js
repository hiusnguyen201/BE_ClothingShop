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
      let details = error.details.map((item) => ({
        path: item.path[0],
        message: item.message,
      }));

      if (error.details[0].type === 'object.min') {
        details = details[0].message;
      }

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
