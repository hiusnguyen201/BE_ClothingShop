/** @type {import('#src/app/roles/models/role.model')} */

import { newRoleService } from '#src/app/roles/roles.service';
import {
  categoryPermissions,
  customerPermissions,
  notificationPermissions,
  orderPermissions,
  productPermissions,
  userPermissions,
} from '#src/database/data/permissions-data';

const ROLE_DATA = [
  {
    name: 'Admin',
    description: 'Full system access. Can orders, products, categories, and all system configurations.',
    permissions: [
      ...orderPermissions
        .filter((p) => ['read', 'edit', 'create', 'remove'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...userPermissions.filter((p) => ['read'].some((item) => p.name.includes(item))).map((p) => p._id),
      ...customerPermissions
        .filter((p) => ['read', 'edit', 'create', 'remove'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...productPermissions
        .filter((p) => ['read', 'edit', 'create', 'remove'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...categoryPermissions
        .filter((p) => ['read', 'edit', 'create', 'remove'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...notificationPermissions
        .filter((p) => ['read', 'edit', 'create', 'remove'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
    ],
  },
  {
    name: 'Manager',
    description:
      'Responsible for overseeing daily operations such as managing products, categories, orders, and customer information. Limited access to user management.',
    permissions: [
      ...orderPermissions
        .filter((p) => ['read', 'edit', 'create'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...userPermissions.filter((p) => ['read'].some((item) => p.name.includes(item))).map((p) => p._id),
      ...customerPermissions
        .filter((p) => ['read', 'edit', 'create'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...productPermissions
        .filter((p) => ['read', 'edit', 'create'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...categoryPermissions
        .filter((p) => ['read', 'edit', 'create'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
      ...notificationPermissions
        .filter((p) => ['read', 'edit', 'create'].some((item) => p.name.includes(item)))
        .map((p) => p._id),
    ],
  },
  {
    name: 'Staff',
    description:
      'Supports operational tasks such as updating stock levels and processing orders. Has limited access to view and update basic product and customer information.',
    permissions: [
      ...orderPermissions.filter((p) => ['read'].some((item) => p.name.includes(item))).map((p) => p._id),
      ...customerPermissions.filter((p) => ['read'].some((item) => p.name.includes(item))).map((p) => p._id),
      ...productPermissions.filter((p) => ['read'].some((item) => p.name.includes(item))).map((p) => p._id),
      ...categoryPermissions.filter((p) => ['read'].some((item) => p.name.includes(item))).map((p) => p._id),
      ...notificationPermissions.filter((p) => ['read'].some((item) => p.name.includes(item))).map((p) => p._id),
    ],
  },
];

export const roles = ROLE_DATA.map((item) => newRoleService(item));
