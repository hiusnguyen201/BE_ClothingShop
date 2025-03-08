import Joi from 'joi';
import { ValidatableAdapter } from '#core/adapter/ValidatableAdapter';

export class GetUserByIdAdapter extends ValidatableAdapter {
  static schema = Joi.object({
    userId: Joi.objectId().required(),
  });

  static new(payload) {
    const adapter = Joi.plainToSchema(this.schema, payload);
    this.validate(adapter);
    return adapter;
  }
}
