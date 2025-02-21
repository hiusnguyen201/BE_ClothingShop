import Joi from 'joi';
import { options } from '#middlewares/validate-request.middleware';

function isValidJoiSchema(schema) {
  return schema && Joi.isSchema(schema) && typeof schema.validate === 'function';
}

function isValidPlainObject(plainObject) {
  return plainObject && typeof plainObject === 'object' && plainObject !== null;
}

export function plainToSchema(schema, plainObject) {
  if (!isValidPlainObject(plainObject)) {
    throw new Error('plainObject must be an object');
  }

  if (!isValidJoiSchema(schema)) {
    throw new Error('schema must be a Joi schema');
  }

  const { error, value } = schema.validate(plainObject, options);
  if (error) {
    const message = error.details.map((item) => item.message);
    throw new Error('Plain object failed: ' + message);
  }

  return value;
}

export function plainToArraySchema(schema, plainArray) {
  if (!Array.isArray(plainArray)) {
    throw new Error('plainArray must be an array');
  }

  return plainArray.map((item) => plainToSchema(schema, item));
}
