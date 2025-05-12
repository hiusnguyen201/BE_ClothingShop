/** @type {import('#src/app/permissions/models/permission.model')} */

import { newPermissionService } from '#src/app/permissions/permissions.service';
import { faker } from '@faker-js/faker';

export const USERS_PERMISSIONS = {
  GET_USERS: {
    name: 'read:users',
    description: 'View list user',
    module: 'users',
  },
  GET_USER_DETAILS: {
    name: 'read:details:user',
    description: 'View details user',
    module: 'users',
  },
  CREATE_USER: {
    name: 'create:user',
    description: 'Create user',
    module: 'users',
  },
  EDIT_USER: {
    name: 'edit:user',
    description: 'Edit user',
    module: 'users',
  },
  REMOVE_USER: {
    name: 'remove:user',
    description: 'Remove user',
    module: 'users',
  },
  RESET_PASSWORD_USER: {
    name: 'reset-password:user',
    description: 'Reset password user',
    module: 'users',
  },
};

export const userPermissions = Object.values(USERS_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const ROLES_PERMISSIONS = {
  GET_ROLES: {
    name: 'read:roles',
    description: 'View list role',
    module: 'roles',
  },
  GET_ROLE_DETAILS: {
    name: 'read:details:role',
    description: 'View details role',
    module: 'roles',
  },
  CREATE_ROLE: {
    name: 'create:role',
    description: 'Create role',
    module: 'roles',
  },
  EDIT_ROLE: {
    name: 'edit:role',
    description: 'Edit role',
    module: 'roles',
  },
  REMOVE_ROLE: {
    name: 'remove:role',
    description: 'Remove role',
    module: 'roles',
  },
  GET_ASSIGNED_ROLE_PERMISSIONS: {
    name: 'read:assigned_role_permissions',
    description: 'View list assigned role permissions',
    module: 'roles',
  },
  GET_UNASSIGNED_ROLE_PERMISSIONS: {
    name: 'read:unassigned_role_permissions',
    description: 'View list unassigned role permissions',
    module: 'roles',
  },
  ADD_ROLE_PERMISSIONS: {
    name: 'add:role_permissions',
    description: 'Add role permission',
    module: 'roles',
  },
  REMOVE_ROLE_PERMISSIONS: {
    name: 'remove:role_permissions',
    description: 'Remove role permission',
    module: 'roles',
  },
};

export const rolePermissions = Object.values(ROLES_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const PERMISSIONS_PERMISSIONS = {
  GET_PERMISSIONS: {
    name: 'read:permissions',
    description: 'View list permission',
    module: 'permissions',
  },
};

export const permissionPermissions = Object.values(PERMISSIONS_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const CATEGORIES_PERMISSIONS = {
  GET_CATEGORIES: {
    name: 'read:categories',
    description: 'View list category',
    module: 'categories',
  },
  GET_CATEGORY_DETAILS: {
    name: 'read:details:category',
    description: 'View details category',
    module: 'categories',
  },
  CREATE_CATEGORY: {
    name: 'create:category',
    description: 'Create category',
    module: 'categories',
  },
  EDIT_CATEGORY: {
    name: 'edit:category',
    description: 'Edit category',
    module: 'categories',
  },
  REMOVE_CATEGORY: {
    name: 'remove:category',
    description: 'Remove category',
    module: 'categories',
  },
  GET_SUB_CATEGORIES: {
    name: 'read:sub_categories',
    description: 'Get list subcategories',
    module: 'categories',
  },
};

export const categoryPermissions = Object.values(CATEGORIES_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const CUSTOMERS_PERMISSIONS = {
  GET_CUSTOMERS: {
    name: 'read:customers',
    description: 'View list customer',
    module: 'customers',
  },
  GET_DETAILS_CUSTOMER: {
    name: 'read:details:customer',
    description: 'View details customer',
    module: 'customers',
  },
  CREATE_CUSTOMER: {
    name: 'create:customer',
    description: 'Create customer',
    module: 'customers',
  },
  EDIT_CUSTOMER: {
    name: 'edit:customer',
    description: 'Edit customer',
    module: 'customers',
  },
  REMOVE_CUSTOMER: {
    name: 'remove:customer',
    description: 'Remove customer',
    module: 'customers',
  },
};

export const customerPermissions = Object.values(CUSTOMERS_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const PRODUCTS_PERMISSIONS = {
  GET_PRODUCTS: {
    name: 'read:products',
    description: 'View list product',
    module: 'products',
  },
  GET_DETAILS_PRODUCT: {
    name: 'read:details:product',
    description: 'View details product',
    module: 'products',
  },
  CREATE_PRODUCT: {
    name: 'create:product',
    description: 'Create product',
    module: 'products',
  },
  EDIT_PRODUCT_INFO: {
    name: 'edit:product_info',
    description: 'Edit product info',
    module: 'products',
  },
  EDIT_PRODUCT_VARIANTS: {
    name: 'edit:product_variants',
    description: 'Edit product variants',
    module: 'products',
  },
  REMOVE_PRODUCT: {
    name: 'remove:product',
    description: 'Remove product',
    module: 'products',
  },
};

export const productPermissions = Object.values(PRODUCTS_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const ORDER_PERMISSIONS = {
  GET_ORDERS: {
    name: 'read:orders',
    description: 'View list order',
    module: 'orders',
  },
  GET_DETAILS_ORDER: {
    name: 'read:details:order',
    description: 'View details order',
    module: 'orders',
  },
  CREATE_ORDER: {
    name: 'create:order',
    description: 'Create order',
    module: 'orders',
  },
  REMOVE_ORDER: {
    name: 'remove:order',
    description: 'Remove order',
    module: 'orders',
  },
  CONFIRM_ORDER: {
    name: 'confirm:order',
    description: 'Confirm order',
    module: 'orders',
  },
  CANCEL_ORDER: {
    name: 'cancel:order',
    description: 'Cancel order',
    module: 'orders',
  },
  PROCESSING_ORDER: {
    name: 'processing:order',
    description: 'Start processing order',
    module: 'orders',
  },
  CREATE_SHIP_ORDER: {
    name: 'create-ship:order',
    description: 'Create ship order',
    module: 'orders',
  },
};

export const orderPermissions = Object.values(ORDER_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const NOTIFICATION_PERMISSIONS = {
  NEW_CUSTOMER: {
    name: 'notify:new_customer',
    description: 'New customer notification',
    module: 'customers',
  },
  NEW_ORDER: {
    name: 'notify:new_order',
    description: 'New order notification',
    module: 'orders',
  },
  LOW_STOCK: {
    name: 'notify:low_stock',
    description: 'Low stock notification',
    module: 'products',
  },
  CONFIRM_ORDER: {
    name: 'notify:confirm_order',
    description: 'Confirm order notification',
    module: 'orders',
  },
  PROCESSING_ORDER: {
    name: 'notify:processing_order',
    description: 'Processing order notification',
    module: 'orders',
  },
  READY_FOR_PICKUP_ORDER: {
    name: 'notify:ready_for_pickup_order',
    description: 'Ready for pickup order notification',
    module: 'orders',
  },
  SHIPPING_ORDER: {
    name: 'notify:shipping_order',
    description: 'Shipping order notification',
    module: 'orders',
  },
  CANCEL_ORDER: {
    name: 'notify:cancel_order',
    description: 'Cancel order notification',
    module: 'orders',
  },
  COMPLETE_ORDER: {
    name: 'notify:complete_order',
    description: 'Complete order notification',
    module: 'orders',
  },
};

export const notificationPermissions = Object.values(NOTIFICATION_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const EXPORT_PERMISSIONS = {
  USER_EXCEL: {
    name: 'export:users:excel',
    description: 'Export user data to Excel',
    module: 'users',
  },
  USER_PDF: {
    name: 'export:users:pdf',
    description: 'Export user data to PDF',
    module: 'users',
  },
  ROLE_EXCEL: {
    name: 'export:roles:excel',
    description: 'Export role data to Excel',
    module: 'roles',
  },
  ROLE_PDF: {
    name: 'export:roles:pdf',
    description: 'Export role data to PDF',
    module: 'roles',
  },
  PERMISSION_EXCEL: {
    name: 'export:permissions:excel',
    description: 'Export permission data to Excel',
    module: 'permissions',
  },
  PERMISSION_PDF: {
    name: 'export:permissions:pdf',
    description: 'Export permission data to PDF',
    module: 'permissions',
  },
  CATEGORY_EXCEL: {
    name: 'export:categories:excel',
    description: 'Export category data to Excel',
    module: 'categories',
  },
  CATEGORY_PDF: {
    name: 'export:categories:pdf',
    description: 'Export category data to PDF',
    module: 'categories',
  },
  CUSTOMER_EXCEL: {
    name: 'export:customers:excel',
    description: 'Export customer data to Excel',
    module: 'customers',
  },
  CUSTOMER_PDF: {
    name: 'export:customers:pdf',
    description: 'Export customer data to PDF',
    module: 'customers',
  },
  PRODUCT_EXCEL: {
    name: 'export:products:excel',
    description: 'Export product data to Excel',
    module: 'products',
  },
  PRODUCT_PDF: {
    name: 'export:products:pdf',
    description: 'Export product data to PDF',
    module: 'products',
  },
  ORDER_EXCEL: {
    name: 'export:orders:excel',
    description: 'Export order data to Excel',
    module: 'orders',
  },
  ORDER_PDF: {
    name: 'export:orders:pdf',
    description: 'Export order data to PDF',
    module: 'orders',
  },
};

export const exportPermissions = Object.values(EXPORT_PERMISSIONS).map((per) =>
  newPermissionService({ ...per, createdAt: faker.date.past(), updatedAt: faker.date.past() }),
);

export const permissions = [
  ...userPermissions,
  ...rolePermissions,
  ...permissionPermissions,
  ...categoryPermissions,
  ...customerPermissions,
  ...productPermissions,
  ...orderPermissions,
  ...notificationPermissions,
  ...exportPermissions,
];
