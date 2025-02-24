import Joi from 'joi';
import { Assert } from '#core/assert/Assert';
import { BadRequestException } from '#core/exception/http-exception';

const options = {
  abortEarly: false, // when true, stops validation on the first error, otherwise returns all the errors found. Defaults to true.
  allowUnknown: true, //  when true, allows object to contain unknown keys which are ignored. Defaults to false.
  stripUnknown: true, //  when true, ignores unknown keys with a function value. Defaults to false.
};

export class ValidatableAdapter {
  static schema = null;

  static validate(payload) {
    Assert.isTrue(this.schema && Joi.isSchema(this.schema), new Error('schema must be a Joi schema'));
    const { error } = this.schema.validate(payload, options);
    if (error) {
      const message = error.details.map((item) => item.message);
      throw new BadRequestException(message);
    }
  }
}
