'use strict';
import mongoose from 'mongoose';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';

const options = {
  abortEarly: false, // when true, stops validation on the first error, otherwise returns all the errors found. Defaults to true.
  allowUnknown: true, //  when true, allows object to contain unknown keys which are ignored. Defaults to false.
  stripUnknown: true, //  when true, ignores unknown keys with a function value. Defaults to false.
};

export class ModelDto {
  static new(schema, data) {
    if (data && data instanceof mongoose.Document) {
      data = data.toObject();
    }
    // Convert ObjectId to string
    data._id = data._id.toString();

    let { error, value } = schema.validate(data, options);
    if (error) {
      const message = error.details.map((item) => item.message);
      throw HttpException.new({ code: Code.ENTITY_VALIDATION_FAILED, overrideMessage: message });
    }

    // Convert _id to id
    value = { id: value._id, ...value };
    delete value._id;

    return value;
  }

  static newList(schema, data = []) {
    return data.map((item) => this.new(schema, item));
  }
}
