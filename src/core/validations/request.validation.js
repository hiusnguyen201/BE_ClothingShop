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

export const validateSchema = async (schema, data) => {
  const { error, value } = await schema.validate(data, options);

  if (error) {
    let details = error.details.map((item) => ({
      path: item.path[0],
      message: item.message,
    }));

    if (error.details[0].type === 'object.min') {
      details = details[0].message;
    }

    throw HttpException.new({ code: Code.INVALID_DATA, overrideMessage: 'Request validation error', data: details });
  }

  return value;
};

export const validateBody = (schema) => validateSchema(schema, 'body');

export const validateParams = (schema) => validateSchema(schema, 'params');

export const validateQuery = (schema) => validateSchema(schema, 'query');
