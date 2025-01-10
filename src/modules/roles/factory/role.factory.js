import { faker } from "@faker-js/faker";
import { createRoleService } from "#src/modules/roles/roles.service";
import { makeSlug } from "#src/utils/string.util";

/** @type {import('#src/modules/roles/schemas/role.schema')} */

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
