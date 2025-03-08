'use strict';
import Joi from 'joi';

export class UserSchemaDto {
  static schema = Joi.object({
    _id: Joi.objectId(),
    avatar: Joi.string().allow(null),
    name: Joi.string(),
    phone: Joi.string().allow(null),
    gender: Joi.string().allow(null),
    email: Joi.string().email(),
    isVerified: Joi.boolean(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  });

  static newFromUser(user) {
    return Joi.plainToSchema(this.schema, user);
  }

  static newListFromUsers(users) {
    return users.map((user) => this.newFromUser(user));
  }
}
