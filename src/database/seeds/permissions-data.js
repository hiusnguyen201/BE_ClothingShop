/** @type {import('#src/app/permissions/models/permission.model')} */

const USERS_PERMISSIONS = [
  {
    name: 'read:users',
    description: 'View list user',
    module: 'users',
    endpoint: '/api/users/get-users',
    method: 'GET',
  },
  {
    name: 'read:details:user',
    description: 'View details user',
    module: 'users',
    endpoint: '/api/users/get-user-by-id/:userId',
    method: 'GET',
  },
  {
    name: 'create:user',
    description: 'Create user',
    module: 'users',
    endpoint: '/api/users/create-user',
    method: 'POST',
  },
  {
    name: 'edit:user',
    description: 'Edit user',
    module: 'users',
    endpoint: '/api/users/update-user-by-id/:userId',
    method: 'PUT',
  },
  {
    name: 'remove:user',
    description: 'Remove user',
    module: 'users',
    endpoint: '/api/users/remove-user-by-id/:userId',
    method: 'DELETE',
  },
];

const ROLES_PERMISSIONS = [
  {
    name: 'read:roles',
    description: 'View list role',
    module: 'roles',
    endpoint: '/api/roles/get-roles',
    method: 'GET',
  },
  {
    name: 'read:details:role',
    description: 'View details role',
    module: 'roles',
    endpoint: '/api/roles/get-role-by-id/:roleId',
    method: 'GET',
  },
  {
    name: 'create:role',
    description: 'Create role',
    module: 'roles',
    endpoint: '/api/roles/create-role',
    method: 'POST',
  },
  {
    name: 'edit:role',
    description: 'Edit role',
    module: 'roles',
    endpoint: '/api/roles/update-role-by-id/:roleId',
    method: 'PUT',
  },
  {
    name: 'remove:role',
    description: 'Remove role',
    module: 'roles',
    endpoint: '/api/roles/remove-role-by-id/:roleId',
    method: 'DELETE',
  },
  {
    name: 'read:assigned_role_permissions',
    description: 'View list assigned role permissions',
    module: 'roles',
    endpoint: '/api/roles/:roleId/assigned-permissions',
    method: 'GET',
  },
  {
    name: 'read:unassigned_role_permissions',
    description: 'View list unassigned role permissions',
    module: 'roles',
    endpoint: '/api/roles/:roleId/unassigned-permissions',
    method: 'GET',
  },
  {
    name: 'add:role_permissions',
    description: 'Add role permission',
    module: 'roles',
    endpoint: '/api/roles/:roleId/permissions',
    method: 'PATCH',
  },
  {
    name: 'remove:role_permissions',
    description: 'Remove role permission',
    module: 'roles',
    endpoint: '/api/roles/:roleId/permissions/:permissionId',
    method: 'DELETE',
  },
];

const PERMISSIONS_PERMISSIONS = [
  {
    name: 'read:permissions',
    description: 'View list permission',
    module: 'permissions',
    endpoint: '/api/permissions/get-permissions',
    method: 'GET',
  },
];

const CATEGORIES_PERMISSIONS = [
  {
    name: 'read:categories',
    description: 'View list category',
    module: 'categories',
    endpoint: '/api/categories/get-categories',
    method: 'GET',
  },
  {
    name: 'read:details:category',
    description: 'View details category',
    module: 'categories',
    endpoint: '/api/categories/get-category-by-id/:categoryId',
    method: 'GET',
  },
  {
    name: 'create:category',
    description: 'Create category',
    module: 'categories',
    endpoint: '/api/categories/create-category',
    method: 'POST',
  },
  {
    name: 'edit:category',
    description: 'Edit category',
    module: 'categories',
    endpoint: '/api/categories/update-category-by-id/:categoryId',
    method: 'PUT',
  },
  {
    name: 'remove:category',
    description: 'Remove category',
    module: 'categories',
    endpoint: '/api/categories/remove-category-by-id/:categoryId',
    method: 'DELETE',
  },
  {
    name: 'get:sub_categories',
    description: 'Get list subcategories',
    module: 'categories',
    endpoint: '/api/categories/:categoryId/subcategories',
    method: 'GET',
  },
];

const CUSTOMERS_PERMISSIONS = [
  {
    name: 'read:customers',
    description: 'View list customer',
    module: 'customers',
    endpoint: '/api/customers/get-customers',
    method: 'GET',
  },
  {
    name: 'read:details:customer',
    description: 'View details customer',
    module: 'customers',
    endpoint: '/api/customers/get-customer-by-id/:customerId',
    method: 'GET',
  },
  {
    name: 'create:customer',
    description: 'Create customer',
    module: 'customers',
    endpoint: '/api/customers/create-customer',
    method: 'POST',
  },
  {
    name: 'edit:customer',
    description: 'Edit customer',
    module: 'customers',
    endpoint: '/api/customers/update-customer-by-id/:customerId',
    method: 'PUT',
  },
  {
    name: 'remove:customer',
    description: 'Remove customer',
    module: 'customers',
    endpoint: '/api/customers/remove-customer-by-id/:customerId',
    method: 'DELETE',
  },
];

const PRODUCTS_PERMISSIONS = [
  {
    name: 'read:products',
    description: 'View list product',
    module: 'products',
    endpoint: '/api/products/get-products',
    method: 'GET',
  },
  {
    name: 'read:details:product',
    description: 'View details product',
    module: 'products',
    endpoint: '/api/products/get-product-by-id/:productId',
    method: 'GET',
  },
  {
    name: 'create:product',
    description: 'Create product',
    module: 'products',
    endpoint: '/api/products/create-product',
    method: 'POST',
  },
  {
    name: 'edit:product_info',
    description: 'Edit product info',
    module: 'products',
    endpoint: '/api/products/update-product-info/:productId',
    method: 'PUT',
  },
  {
    name: 'edit:product_variants',
    description: 'Edit product variants',
    module: 'products',
    endpoint: '/api/products/update-product-variants/:productId',
    method: 'PUT',
  },
  {
    name: 'remove:product',
    description: 'Remove product',
    module: 'products',
    endpoint: '/api/products/remove-product-by-id/:productId',
    method: 'DELETE',
  },
];

export const PERMISSIONS_LIST = [
  ...USERS_PERMISSIONS,
  ...ROLES_PERMISSIONS,
  ...PERMISSIONS_PERMISSIONS,
  ...CATEGORIES_PERMISSIONS,
  ...CUSTOMERS_PERMISSIONS,
  ...PRODUCTS_PERMISSIONS,
];
