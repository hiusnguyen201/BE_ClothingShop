'use strict';
import Joi from 'joi';
import { ValidatableAdapter } from '#src/core/adapter/ValidatableAdapter';

export class CheckExistEmailAdapter extends ValidatableAdapter {
  static schema = Joi.object({
    email: Joi.string().required().email(),
  });

  static new(payload) {
    const adapter = Joi.plainToSchema(this.schema, payload);
    this.validate(adapter);
    return adapter;
  }
}
