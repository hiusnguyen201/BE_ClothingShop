import { faker } from '@faker-js/faker';
import { createPermissionService } from '#src/app/permissions/permissions.service';

/** @type {import('#src/app/permissions/models/permission.model')} */

class PermissionFactory {
  constructor() {
    this.default = {
      name: faker.internet.username(),
      module: faker.internet.username(),
      method: faker.internet.httpMethod(),
      endpoint: faker.internet.url(),
    };
  }

  async createPermission(overrides = {}) {
    return await createPermissionService({
      ...this.default,
      ...overrides,
    });
  }
}

export default new PermissionFactory();
