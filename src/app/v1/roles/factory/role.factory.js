import { faker } from '@faker-js/faker';
import { createRoleService } from '#src/app/v1/roles/roles.service';
import { makeSlug } from '#src/utils/string.util';

/** @type {import('#src/models/role.model')} */

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
