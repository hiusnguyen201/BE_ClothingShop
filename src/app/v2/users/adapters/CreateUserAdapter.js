'use strict';
import Joi from 'joi';
import { UserConstant } from '#app/v2/users/UserConstant';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';
import { ValidatableAdapter } from '#core/adapter/ValidatableAdapter';

export class CreateUserAdapter extends ValidatableAdapter {
  static schema = Joi.object({
    avatar: Joi.buffer(),
    name: Joi.string()
      .required()
      .custom((value) => replaceMultiSpacesToSingleSpace(value)),
    email: Joi.string().required().email(),
    gender: Joi.string().valid(...Object.values(UserConstant.GENDER)),
    roleId: Joi.objectId(),
    phone: Joi.phoneNumber('VN'),
  });

  static new(payload) {
    const adapter = Joi.plainToSchema(this.schema, payload);
    this.validate(adapter);
    return adapter;
  }
}
