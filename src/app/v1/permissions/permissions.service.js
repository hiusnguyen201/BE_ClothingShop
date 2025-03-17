import { isValidObjectId } from 'mongoose';
import { PermissionModel } from '#src/models/permission.model';
import { makeSlug } from '#src/utils/string.util';

/**
 * Create permission
 * @param {*} data
 * @returns
 */
export async function createPermissionService(data) {
  return await PermissionModel.create(data);
}

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

  const existingSet = new Set(existingPermissions.map((p) => `${p.endpoint}-${p.method}`));

  const newPermissions = data
    .filter((p) => !existingSet.has(`${p.endpoint}-${p.method}`))
    .map((p) => ({ ...p, slug: makeSlug(p.name) }));

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
export async function getAllPermissionsService({ filters, offset = 0, limit = 10 }) {
  return PermissionModel.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 }).lean();
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

/**
 * Update permission info by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updatePermissionInfoByIdService(id, data) {
  return PermissionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).lean();
}

/**
 * Remove permission by id
 * @param {*} id
 * @returns
 */
export async function removePermissionByIdService(id, removerId) {
  return PermissionModel.findByIdAndSoftDelete(id, removerId).lean();
}

/**
 * Check exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistPermissionNameService(name, skipId) {
  const filters = { name };

  if (skipId) {
    filters._id = { $ne: skipId };
  }

  const result = await PermissionModel.findOne(filters, '_id', { withDeleted: true }).lean();
  return !!result;
}

/**
 * Activate permission
 * @param {*} id
 * @returns
 */
export async function activatePermissionByIdService(id) {
  return PermissionModel.findByIdAndUpdate(
    id,
    {
      isActive: true,
    },
    { new: true },
  ).lean();
}

/**
 * Deactivate permission
 * @param {*} id
 * @returns
 */
export async function deactivatePermissionByIdService(id) {
  return PermissionModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    { new: true },
  ).lean();
}
