import { USER_TYPES } from "#src/core/constant";
import { faker } from "@faker-js/faker";
import { createUserService } from "#src/modules/users/users.service";
import { makeHash } from "#src/utils/bcrypt.util";

/** @type {import('#src/modules/users/schemas/user.schema')} */

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

    return await createUserService({
      ...data,
      password: makeHash(data.password),
    });
  }
}

export default new UserFactory();
