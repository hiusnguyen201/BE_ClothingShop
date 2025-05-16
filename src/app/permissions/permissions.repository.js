import { isValidObjectId } from 'mongoose';
import { PermissionModel } from '#src/app/permissions/models/permission.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { PERMISSION_SELECTED_FIELDS } from '#src/app/permissions/permissions.constant';

/**
 * New permission instance
 * @param {*} data
 * @returns
 */
export function newPermissionRepository(data) {
  return new PermissionModel(data);
}

/**
 * Save list permission
 * @param {*} data
 * @returns
 */
export async function saveListPermissionsRepository(data = [], session) {
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
export async function getAndCountPermissionsRepository(filters, skip, limit, sortBy, sortOrder) {
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
export async function getPermissionsRepository(filters, skip, limit, sortBy, sortOrder) {
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
export async function getPermissionByIdRepository(id) {
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
export async function createPermissionRepository(data) {
  return PermissionModel.create(data);
}
