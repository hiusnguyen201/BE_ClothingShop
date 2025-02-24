import { faker } from '@faker-js/faker';
import { UserConstant } from '#app/v2/users/UserConstant';
import { createUserService } from '#app/v1/users/users.service';

/** @type {import('#src/app/v1/users/models/user.model')} */

class UserFactory {
  constructor() {
    this.default = {
      name: faker.internet.displayName(),
      email: faker.internet.email(),
      type: UserConstant.USER_TYPES.USER,
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
