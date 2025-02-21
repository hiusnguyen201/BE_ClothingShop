/** @type {import('#src/app/permissions/models/permission.model')} */

import { makeSlug } from '#utils/string.util';

const USERS_PERMISSIONS = [
  {
    name: 'Get users list',
    module: 'users',
    endpoint: '/api/v1/users/get-users',
    method: 'GET',
  },
  {
    name: 'Get user by id',
    module: 'users',
    endpoint: '/api/v1/users/get-user-by-id/:id',
    method: 'GET',
  },
  {
    name: 'Create user',
    module: 'users',
    endpoint: '/api/v1/users/create-user',
    method: 'POST',
  },
  {
    name: 'Update user by id',
    module: 'users',
    endpoint: '/api/v1/users/update-user-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Remove user by id',
    module: 'users',
    endpoint: '/api/v1/users/remove-user-by-id/:id',
    method: 'DELETE',
  },
];

const ROLES_PERMISSIONS = [
  {
    name: 'Get roles list',
    module: 'roles',
    endpoint: '/api/v1/roles/get-roles',
    method: 'GET',
  },
  {
    name: 'Get role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/get-role-by-id/:id',
    method: 'GET',
  },
  {
    name: 'Create role',
    module: 'roles',
    endpoint: '/api/v1/roles/create-role',
    method: 'POST',
  },
  {
    name: 'Update role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/update-role-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Remove role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/remove-role-by-id/:id',
    method: 'DELETE',
  },
  {
    name: 'Activate role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/activate-role-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Deactivate role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/deactivate-role-by-id/:id',
    method: 'PATCH',
  },
];

const PERMISSIONS_PERMISSIONS = [
  {
    name: 'Get permissions list',
    module: 'permissions',
    endpoint: '/api/v1/permissions/get-permissions',
    method: 'GET',
  },
  {
    name: 'Get permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/get-permission-by-id/:id',
    method: 'GET',
  },
  {
    name: 'Update permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/update-permission-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Remove permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/remove-permission-by-id/:id',
    method: 'DELETE',
  },
  {
    name: 'Activate permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/activate-permission-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Deactivate permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/deactivate-permission-by-id/:id',
    method: 'PATCH',
  },
];

const CATEGORIES_PERMISSIONS = [
  {
    name: 'Get categories list',
    module: 'categories',
    endpoint: '/api/v1/categories/get-categories',
    method: 'GET',
  },
  {
    name: 'Get category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/get-category-by-id/:id',
    method: 'GET',
  },
  {
    name: 'Create category',
    module: 'categories',
    endpoint: '/api/v1/categories/create-category/:id',
    method: 'GET',
  },
  {
    name: 'Update category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/update-category-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Remove category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/remove-category-by-id/:id',
    method: 'DELETE',
  },
  {
    name: 'Show category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/show-category-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Hide categories by id',
    module: 'categories',
    endpoint: '/api/v1/categories/hide-category-by-id/:id',
    method: 'PATCH',
  },
];

const CUSTOMERS_PERMISSIONS = [
  {
    name: 'Get customers list',
    module: 'customers',
    endpoint: '/api/v1/customers/get-customers',
    method: 'GET',
  },
  {
    name: 'Get customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/get-customer-by-id/:id',
    method: 'GET',
  },
  {
    name: 'Create customer',
    module: 'customers',
    endpoint: '/api/v1/customers/create-customer/:id',
    method: 'GET',
  },
  {
    name: 'Update customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/update-customer-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Remove customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/remove-customer-by-id/:id',
    method: 'DELETE',
  },
];

const VOUCHERS_PERMISSIONS = [
  {
    name: 'Get vouchers list',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/get-vouchers',
    method: 'GET',
  },
  {
    name: 'Get voucher by id',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/get-voucher-by-id/:id',
    method: 'GET',
  },
  {
    name: 'Create voucher',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/create-voucher/:id',
    method: 'GET',
  },
  {
    name: 'Update voucher by id',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/update-voucher-by-id/:id',
    method: 'PATCH',
  },
  {
    name: 'Remove voucher by id',
    module: 'vouchers',
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
