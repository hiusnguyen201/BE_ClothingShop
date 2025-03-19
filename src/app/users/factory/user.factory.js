import { faker } from '@faker-js/faker';
import { USER_TYPE } from '#src/app/users/users.constant';
import { createUserService } from '#src/app/users/users.service';

/** @type {import('#src/app/users/models/user.model')} */

class UserFactory {
  constructor() {
    this.default = {
      name: faker.internet.displayName(),
      email: faker.internet.email(),
      type: USER_TYPE.USER,
      password: faker.internet.password(),
      role: null,
    };
  }

  async createUser(overrides = {}) {
    const data = {
      ...this.default,
      ...overrides,
    };

    return createUserService(data);
  }
}

export default new UserFactory();
