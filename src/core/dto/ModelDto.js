'use strict';
import mongoose, { isValidObjectId } from 'mongoose';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';

const options = {
  abortEarly: false, // when true, stops validation on the first error, otherwise returns all the errors found. Defaults to true.
  allowUnknown: true, //  when true, allows object to contain unknown keys which are ignored. Defaults to false.
  stripUnknown: true, //  when true, ignores unknown keys with a function value. Defaults to false.
};

function convertId(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertId);
  }

  if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!value) {
        acc[key] = null;
      } else if (isValidObjectId(value)) {
        acc[key === '_id' ? 'id' : key] = typeof value === 'number' ? +value : value.toString();
      } else if (value instanceof Date || Array.isArray(value)) {
        acc[key] = value;
      } else {
        acc[key] = convertId(value);
      }
      return acc;
    }, {});
  }

  return obj;
}

export class ModelDto {
  static new(schema, data) {
    if (data && data instanceof mongoose.Document) {
      data = data.toObject();
    }

    // Convert ObjectId to string
    if (data._id) {
      data._id = data._id.toString();
    }

    let { error, value } = schema.validate(data, options);
    if (error) {
      const message = error.details.map((item) => item.message);
      throw HttpException.new({ code: Code.ENTITY_VALIDATION_FAILED, overrideMessage: message });
    }

    // Convert _id to id
    value = convertId(value);

    return value;
  }

  static newList(schema, data = []) {
    return data.map((item) => this.new(schema, item));
  }
}
