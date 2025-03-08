import Joi from 'joi';
import mongoose from 'mongoose';
import { Assert } from '#core/assert/Assert';
import { BadRequestException } from '#core/exception/http-exception';

const options = {
  abortEarly: false, // when true, stops validation on the first error, otherwise returns all the errors found. Defaults to true.
  allowUnknown: true, //  when true, allows object to contain unknown keys which are ignored. Defaults to false.
  stripUnknown: true, //  when true, ignores unknown keys with a function value. Defaults to false.
};

function isValidJoiSchema(schema) {
  return schema && Joi.isSchema(schema) && typeof schema.validate === 'function';
}

function isValidPlainObject(plainObject) {
  return plainObject && typeof plainObject === 'object' && plainObject !== null;
}

Joi.plainToSchema = function (schema, plainObject) {
  Assert.isTrue(isValidPlainObject(plainObject), new Error('plainObject must be an object'));
  Assert.isTrue(isValidJoiSchema(schema), new Error('schema must be a Joi schema'));

  plainObject = plainObject instanceof mongoose.Document ? plainObject.toObject() : plainObject;

  const { error, value } = schema.validate(plainObject, options);
  if (error) {
    const message = error.details.map((item) => item.message);
    throw new BadRequestException(message);
  }

  return value;
};

export default Joi;
