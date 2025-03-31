import { faker } from '@faker-js/faker';
import { createRoleService } from '#src/app/roles/roles.service';

/** @type {import('#src/app/roles/models/role.model')} */

class RoleFactory {
  constructor() {
    this.default = {
      name: faker.internet.username(),
      description: 'This',
      permissions: [],
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
