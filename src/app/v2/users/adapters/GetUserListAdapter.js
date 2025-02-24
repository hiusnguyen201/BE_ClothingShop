import Joi from 'joi';
import { GetModelListAdapter } from '#core/adapter/GetModelListAdapter';
import { ValidatableAdapter } from '#core/adapter/ValidatableAdapter';
import { UserConstant } from '#app/v2/users/UserConstant';

export class GetUserListAdapter extends ValidatableAdapter {
  static schema = GetModelListAdapter.schema.keys({
    status: Joi.valid(UserConstant.USER_STATUS.ACTIVE, UserConstant.USER_STATUS.INACTIVE),
  });

  static new(payload) {
    const adapter = Joi.plainToSchema(this.schema, payload);
    this.validate(adapter);
    return adapter;
  }
}
