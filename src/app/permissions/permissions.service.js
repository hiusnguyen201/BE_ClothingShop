import { isValidObjectId } from 'mongoose';
import { PermissionModel } from '#src/app/permissions/models/permission.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { PERMISSION_SELECTED_FIELDS } from '#src/app/permissions/permissions.constant';

/**
 * New permission instance
 * @param {*} data
 * @returns
 */
export function newPermissionService(data) {
  return new PermissionModel(data);
}

/**
 * Save list permission
 * @param {*} data
 * @returns
 */
export async function saveListPermissionsService(data = [], session) {
  return await PermissionModel.bulkSave(data, { session, ordered: true });
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
