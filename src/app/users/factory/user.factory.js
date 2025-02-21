import { USER_TYPES } from '#core/constant';
import { faker } from '@faker-js/faker';
import { createUserService } from '#app/users/users.service';

/** @type {import('#src/app/users/models/user.model')} */

class UserFactory {
  constructor() {
    this.default = {
      name: faker.internet.displayName(),
      email: faker.internet.email(),
      type: USER_TYPES.USER,
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
