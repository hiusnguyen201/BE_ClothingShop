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
 * Get all permissions
 * @param {*} param0
 * @returns
 */
export async function getAllPermissionsService(payload) {
  const { filters = {}, page, limit, sortBy, sortOrder } = payload;

  let queryOptions = {};
  queryOptions = extendQueryOptionsWithPagination({ page, limit }, queryOptions);
  queryOptions = extendQueryOptionsWithSort({ sortBy, sortOrder }, queryOptions);

  return PermissionModel.find(filters, PERMISSION_SELECTED_FIELDS, queryOptions).lean();
}

/**
 * Count all permissions
 * @param {*} filters
 * @returns
 */
export async function countAllPermissionsService(filters) {
  return PermissionModel.countDocuments(filters);
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
