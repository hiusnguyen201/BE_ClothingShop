/** @type {import('#src/models/permission.model')} */

const USERS_PERMISSIONS = [
  {
    name: 'Get users list',
    module: 'users',
    endpoint: '/api/v1/users/get-users',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Get user by id',
    module: 'users',
    endpoint: '/api/v1/users/get-user-by-id/:id',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Create user',
    module: 'users',
    endpoint: '/api/v1/users/create-user',
    method: 'POST',
    isActive: true,
  },
  {
    name: 'Update user by id',
    module: 'users',
    endpoint: '/api/v1/users/update-user-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Remove user by id',
    module: 'users',
    endpoint: '/api/v1/users/remove-user-by-id/:id',
    method: 'DELETE',
    isActive: true,
  },
];

const ROLES_PERMISSIONS = [
  {
    name: 'Get roles list',
    module: 'roles',
    endpoint: '/api/v1/roles/get-roles',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Get role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/get-role-by-id/:id',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Create role',
    module: 'roles',
    endpoint: '/api/v1/roles/create-role',
    method: 'POST',
    isActive: true,
  },
  {
    name: 'Update role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/update-role-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Remove role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/remove-role-by-id/:id',
    method: 'DELETE',
    isActive: true,
  },
  {
    name: 'Activate role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/activate-role-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Deactivate role by id',
    module: 'roles',
    endpoint: '/api/v1/roles/deactivate-role-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
];

const PERMISSIONS_PERMISSIONS = [
  {
    name: 'Get permissions list',
    module: 'permissions',
    endpoint: '/api/v1/permissions/get-permissions',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Get permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/get-permission-by-id/:id',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Create permission',
    module: 'permissions',
    endpoint: '/api/v1/permissions/create-permission',
    method: 'POST',
    isActive: true,
  },
  {
    name: 'Update permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/update-permission-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Remove permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/remove-permission-by-id/:id',
    method: 'DELETE',
    isActive: true,
  },
  {
    name: 'Activate permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/activate-permission-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Deactivate permission by id',
    module: 'permissions',
    endpoint: '/api/v1/permissions/deactivate-permission-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
];

const CATEGORIES_PERMISSIONS = [
  {
    name: 'Get categories list',
    module: 'categories',
    endpoint: '/api/v1/categories/get-categories',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Get category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/get-category-by-id/:id',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Create category',
    module: 'categories',
    endpoint: '/api/v1/categories/create-category',
    method: 'POST',
    isActive: true,
  },
  {
    name: 'Update category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/update-category-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Remove category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/remove-category-by-id/:id',
    method: 'DELETE',
    isActive: true,
  },
  {
    name: 'Show category by id',
    module: 'categories',
    endpoint: '/api/v1/categories/show-category-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Hide categories by id',
    module: 'categories',
    endpoint: '/api/v1/categories/hide-category-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
];

const CUSTOMERS_PERMISSIONS = [
  {
    name: 'Get customers list',
    module: 'customers',
    endpoint: '/api/v1/customers/get-customers',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Get customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/get-customer-by-id/:id',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Create customer',
    module: 'customers',
    endpoint: '/api/v1/customers/create-customer',
    method: 'POST',
    isActive: true,
  },
  {
    name: 'Update customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/update-customer-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Remove customer by id',
    module: 'customers',
    endpoint: '/api/v1/customers/remove-customer-by-id/:id',
    method: 'DELETE',
    isActive: true,
  },
];

const VOUCHERS_PERMISSIONS = [
  {
    name: 'Get vouchers list',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/get-vouchers',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Get voucher by id',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/get-voucher-by-id/:id',
    method: 'GET',
    isActive: true,
  },
  {
    name: 'Create voucher',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/create-voucher',
    method: 'POST',
    isActive: true,
  },
  {
    name: 'Update voucher by id',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/update-voucher-by-id/:id',
    method: 'PATCH',
    isActive: true,
  },
  {
    name: 'Remove voucher by id',
    module: 'vouchers',
    endpoint: '/api/v1/vouchers/remove-voucher-by-id/:id',
    method: 'DELETE',
    isActive: true,
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
