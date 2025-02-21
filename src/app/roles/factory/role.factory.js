import { faker } from '@faker-js/faker';
import { createRoleService } from '#app/roles/roles.service';
import { makeSlug } from '#utils/string.util';

/** @type {import('#src/app/roles/models/role.model')} */

class RoleFactory {
  constructor() {
    this.default = {
      name: faker.internet.username(),
      slug: makeSlug(faker.internet.username()),
      permissions: [],
      isActive: true,
    };
  }

  async createRole(overrides = {}) {
    return await createRoleService({
      ...this.default,
      ...overrides,
    });
  }
}

export default new RoleFactory();
