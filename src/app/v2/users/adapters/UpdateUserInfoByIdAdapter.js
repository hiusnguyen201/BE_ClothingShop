import Joi from 'joi';
import { ValidatableAdapter } from '#core/adapter/ValidatableAdapter';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';
import { UserConstant } from '#app/v2/users/UserConstant';

export class UpdateUserInfoByIdAdapter extends ValidatableAdapter {
  static schema = Joi.object({
    userId: Joi.objectId().required(),
    name: Joi.string().custom((value) => replaceMultiSpacesToSingleSpace(value)),
    email: Joi.string().email(),
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
