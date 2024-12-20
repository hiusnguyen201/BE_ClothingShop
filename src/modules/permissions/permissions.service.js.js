import { isValidObjectId } from "mongoose";
import { PermissionModel } from "#src/modules/permissions/schemas/permission.schema";

const SELECTED_FIELDS =
  "_id name description module endpoint method isActive createdAt updatedAt";

/**
 * Create permission
 * @param {*} data
 * @returns
 */
export async function createPermissionService(data) {
  return PermissionModel.create(data);
}

/**
 * Get all permissions
 * @param {*} param0
 * @returns
 */
export async function getAllPermissionsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return PermissionModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
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
 * @param {*} selectFields
 * @returns
 */
export async function getPermissionByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }

  return PermissionModel.findOne(filter).select(selectFields);
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
  }).select(SELECTED_FIELDS);
}

/**
 * Remove permission by id
 * @param {*} id
 * @returns
 */
export async function removePermissionByIdService(id) {
  return PermissionModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistPermissionNameService(name, skipId) {
  const existRole = await PermissionModel.findOne({
    name,
    _id: { $ne: skipId },
  }).select("_id");
  return Boolean(existRole);
}

/**
 * Activate permission
 * @param {*} id
 * @returns
 */
export async function activatePermissionByIdService(id) {
  await PermissionModel.findByIdAndUpdate(
    id,
    {
      isActive: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
  return;
}

/**
 * Deactivate permission
 * @param {*} id
 * @returns
 */
export async function deactivatePermissionByIdService(id) {
  await PermissionModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
  return;
}