import { BadRequestException } from '#src/core/exception/http-exception';

const options = {
  abortEarly: false, // when true, stops validation on the first error, otherwise returns all the errors found. Defaults to true.
  allowUnknown: true, //  when true, allows object to contain unknown keys which are ignored. Defaults to false.
  stripUnknown: true, //  when true, ignores unknown keys with a function value. Defaults to false.
};

export class Dto {
  static new(schema, data) {
    const { error, value } = schema.validate(data, options);
    if (error) {
      const message = error.details.map((item) => item.message);
      throw new BadRequestException(`Entity validation error`, message);
    }
    return value;
  }

  static newList(schema, data = []) {
    return data.map((item) => this.new(schema, item));
  }
}
