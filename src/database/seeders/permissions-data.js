/** @type {import('#src/models/permission.model')} */

import { makeSlug } from '#utils/string.util';

const USERS_PERMISSIONS = [
  {
    name: 'Get users list',
    module: 'users',
    endpoint: '/api/v1/users/get-users',
    method: 'GET',
    slug: makeSlug('Get users list'),
  },
  {
    name: 'Get user by id',
    module: 'users',
    endpoint: '/api/v1/users/get-user-by-id/:id',
    method: 'GET',
    slug: makeSlug('Get user by id'),
  },
  {
    name: 'Create user',
    module: 'users',
    endpoint: '/api/v1/users/create-user',
    method: 'POST',
    slug: makeSlug('Create user'),
  },
  {
    name: 'Update user by id',
    module: 'users',
    endpoint: '/api/v1/users/update-user-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Update user by id'),
  },
  {
    name: 'Remove user by id',
    module: 'users',
    endpoint: '/api/v1/users/remove-user-by-id/:id',
    method: 'DELETE',
    slug: makeSlug('Remove user by id'),
  },
];

const ROLES_PERMISSIONS = [
  {
    name: 'Get roles list',
    module: 'roles',
    endpoint: '/api/v1/roles/get-roles',
    method: 'GET',
    slug: makeSlug('Get roles list'),
  },
  {
    name: 'Get role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/get-role-by-id/:id',
    method: 'GET',
    slug: makeSlug('Get role by id'),
  },
  {
    name: 'Create role',
    module: 'roles',
    endpoint: '/api/v1/roles/create-role',
    method: 'POST',
    slug: makeSlug('Create role'),
  },
  {
    name: 'Update role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/update-role-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Update role by id'),
  },
  {
    name: 'Remove role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/remove-role-by-id/:id',
    method: 'DELETE',
    slug: makeSlug('Remove role by id'),
  },
  {
    name: 'Activate role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/activate-role-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Activate role by id'),
  },
  {
    name: 'Deactivate role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/deactivate-role-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Deactivate role by id'),
  },
];

const PERMISSIONS_PERMISSIONS = [
  {
    name: 'Get permissions list',
    module: 'permissions',
    endpoint: '/api/v1/permissions/get-permissions',
    method: 'GET',
    slug: makeSlug('Get permissions list'),
  },
  {
    name: 'Get permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/get-permission-by-id/:id',
    method: 'GET',
    slug: makeSlug('Get permission by id'),
  },
  {
    name: 'Update permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/update-permission-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Update permission by id'),
  },
  {
    name: 'Remove permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/remove-permission-by-id/:id',
    method: 'DELETE',
    slug: makeSlug('Remove permission by id'),
  },
  {
    name: 'Activate permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/activate-permission-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Activate permission by id'),
  },
  {
    name: 'Deactivate permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/deactivate-permission-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Deactivate permission by id'),
  },
];

const CATEGORIES_PERMISSIONS = [
  {
    name: 'Get categories list',
    module: 'categories',
    endpoint: '/api/v1/categories/get-categories',
    method: 'GET',
    slug: makeSlug('Get categories list'),
  },
  {
    name: 'Get category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/get-category-by-id/:id',
    method: 'GET',
    slug: makeSlug('Get category by id'),
  },
  {
    name: 'Create category',
    module: 'categories',
    endpoint: '/api/v1/categories/create-category/:id',
    method: 'GET',
    slug: makeSlug('Create category'),
  },
  {
    name: 'Update category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/update-category-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Update category by id'),
  },
  {
    name: 'Remove category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/remove-category-by-id/:id',
    method: 'DELETE',
    slug: makeSlug('Remove category by id'),
  },
  {
    name: 'Show category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/show-category-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Show category by id'),
  },
  {
    name: 'Hide categories by id',
    module: 'categories',
    endpoint: '/api/v1/categories/hide-category-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Hide categories by id'),
  },
];

const CUSTOMERS_PERMISSIONS = [
  {
    name: 'Get customers list',
    module: 'customers',
    endpoint: '/api/v1/customers/get-customers',
    method: 'GET',
    slug: makeSlug('Get customers list'),
  },
  {
    name: 'Get customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/get-customer-by-id/:id',
    method: 'GET',
    slug: makeSlug('Get customer by id'),
  },
  {
    name: 'Create customer',
    module: 'customers',
    endpoint: '/api/v1/customers/create-customer/:id',
    method: 'GET',
    slug: makeSlug('Create customer'),
  },
  {
    name: 'Update customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/update-customer-by-id/:id',
    method: 'PATCH',
    slug: makeSlug('Update customer by id'),
  },
  {
    name: 'Remove customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/remove-customer-by-id/:id',
    method: 'DELETE',
    slug: makeSlug('Remove customer by id'),
  },
];

const VOUCHERS_PERMISSIONS = [
  {
    name: 'Get vouchers list',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/get-vouchers',
    method: 'GET',
    slug: makeSlug('Get vouchers list'),
  },
  {
    name: 'Get voucher by id',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/get-voucher-by-id/:id',
    method: 'GET',
    slug: makeSlug('Get voucher by id'),
  },
  {
    name: 'Create voucher',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/create-voucher/:id',
    method: 'GET',
    slug: makeSlug('Create voucher'),
  },
  {
    name: 'Update voucher by id',
    module: 'vouchers',
    slug: makeSlug('Update voucher by id'),
    endpoint: '/api/v1/vouchers/update-voucher-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Remove voucher by id',
    module: 'vouchers',
    slug: makeSlug('Remove voucher by id'),
    endpoint: '/api/v1/vouchers/remove-voucher-by-id/:id',
    method: 'DELETE',
  },
];

export const PERMISSIONS_LIST = [
  ...USERS_PERMISSIONS,
  ...ROLES_PERMISSIONS,
  ...PERMISSIONS_PERMISSIONS,
  ...CATEGORIES_PERMISSIONS,
  ...CUSTOMERS_PERMISSIONS,
  ...VOUCHERS_PERMISSIONS,
];
