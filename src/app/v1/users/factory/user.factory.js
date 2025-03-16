import { faker } from '@faker-js/faker';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { createUserService } from '#src/app/v1/users/users.service';

/** @type {import('#src/app/v1/users/models/user.model')} */

class UserFactory {
  constructor() {
    this.default = {
      name: faker.internet.displayName(),
      email: faker.internet.email(),
      type: USER_TYPE.USER,
      password: faker.internet.password(),
      isVerified: true,
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
