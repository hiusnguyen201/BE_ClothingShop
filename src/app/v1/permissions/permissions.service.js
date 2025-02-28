import { isValidObjectId } from 'mongoose';
import { PermissionModel } from '#src/models/permission.model';

/**
 * Create permission
 * @param {*} data
 * @returns
 */
export async function createPermissionService(data) {
  return PermissionModel.create(data);
}

/**
 * Insert permissions
 * @param {*} data
 * @returns
 */
export async function insertPermissionsService(data, options) {
  return PermissionModel.insertMany(data, options);
}

/**
 * Get all permissions
 * @param {*} param0
 * @returns
 */
export async function getAllPermissionsService({ filters, offset = 0, limit = 10 }) {
  return PermissionModel.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 });
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
    filter.id = id;
  } else {
    filter.name = id;
  }

  return PermissionModel.findOne(filter);
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
  });
}

/**
 * Remove permission by id
 * @param {*} id
 * @returns
 */
export async function removePermissionByIdService(id) {
  return PermissionModel.findByIdAndSoftDelete(id);
}

/**
 * Check exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistPermissionNameService(name, skipId) {
  const result = await PermissionModel.findOne(
    {
      name,
      id: { $ne: skipId },
    },
    '_id',
    { withDeleted: true },
  );
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
  );
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
  );
}
