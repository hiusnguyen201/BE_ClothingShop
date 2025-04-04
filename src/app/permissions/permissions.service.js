import { isValidObjectId } from 'mongoose';
import { PermissionModel } from '#src/app/permissions/models/permission.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { PERMISSION_SELECTED_FIELDS } from '#src/app/permissions/permissions.constant';

/**
 * Get or create list permission
 * @param {*} data
 * @returns
 */
export async function getOrCreateListPermissionServiceWithTransaction(data = [], session) {
  const existingPermissions = await PermissionModel.find({
    endpoint: { $in: data.map((p) => p.endpoint) },
    method: { $in: data.map((p) => p.method) },
  }).lean();

  const existingSet = new Set(existingPermissions.map((p) => `${p.method} ${p.endpoint}`));

  const newPermissions = data.filter((p) => !existingSet.has(`${p.method} ${p.endpoint}`));

  if (newPermissions.length > 0) {
    const created = await PermissionModel.insertMany(newPermissions, { session });
    return [...existingPermissions, ...created];
  }

  return existingPermissions;
}

/**
 * Get and count permissions
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountPermissionsService(filters, skip, limit, sortBy, sortOrder) {
  const totalCount = await PermissionModel.countDocuments(filters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await PermissionModel.find(filters, PERMISSION_SELECTED_FIELDS, queryOptions).lean();

  return [totalCount, list];
}

/**
 * Get permissions
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getPermissionsService(filters, skip, limit, sortBy, sortOrder) {
  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await PermissionModel.find(filters, PERMISSION_SELECTED_FIELDS, queryOptions).lean();

  return list;
}

/**
 * Get permission by id
 * @param {*} id
 * @returns
 */
export async function getPermissionByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }

  return PermissionModel.findOne(filter).lean();
}

/**
 * Create permission
 * @param {*} id
 * @returns
 */
export async function createPermissionService(data) {
  return PermissionModel.create(data);
}
