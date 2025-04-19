/** @type {import('#src/app/roles/models/role.model')} */

import { newRoleService } from '#src/app/roles/roles.service';
import { permissions } from '#src/database/data/permissions-data';

const roles = [];

export const accessControlManagerRoleInstance = newRoleService({
  name: 'Access Control Manager',
  description: 'Responsibilities include managing role-based access control (RBAC)',
  permissions: permissions.map((p) => p._id),
});

roles.push(accessControlManagerRoleInstance.toObject());

export { roles };
