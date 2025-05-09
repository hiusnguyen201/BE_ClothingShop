import { faker } from '@faker-js/faker';
import { createPermissionService } from '#src/app/permissions/permissions.service';

/** @type {import('#src/app/permissions/models/permission.model')} */

class PermissionFactory {
  constructor() {
    this.default = {
      name: faker.internet.username(),
      module: faker.internet.username(),
      description: faker.lorem.sentence(),
    };
  }

  async createPermission(overrides = {}) {
    const data = {
      ...this.default,
      ...overrides,
    };

    return createPermissionService(data);
  }
}

export default new PermissionFactory();
