import { isValidObjectId } from "mongoose";
import { RoleModel } from "#src/modules/roles/schemas/role.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { getPermissionByIdService } from "#src/modules/permissions/permissions.service";
import { makeSlug } from "#src/utils/string.util";
import { REGEX_PATTERNS } from "#src/core/constant";

const SELECTED_FIELDS =
  "_id icon name slug description isActive permissions createdAt updatedAt";

/**
 * Create role
 * @param {*} data
 * @returns
 */
export async function createRoleService(data) {
  return RoleModel.create(data);
}

/**
 * Create role within transaction
 * @param {*} data
 * @returns
 */
export async function createRolesWithinTransactionService(data, session) {
  return RoleModel.insertMany(data, { session });
}

/**
 * Get all roles
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllRolesService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return RoleModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all roles
 * @param {*} filters
 * @returns
 */
export async function countAllRolesService(filters) {
  return RoleModel.countDocuments(filters);
}

/**
 * Get role by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getRoleByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return RoleModel.findOne(filter).select(selectFields);
}

/**
 * Remove role by id
 * @param {*} id
 * @returns
 */
export async function removeRoleByIdService(id) {
  return RoleModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist role name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistRoleNameService(name, skipId) {
  const existRole = await RoleModel.findOne({
    $or: [{ name }, { slug: makeSlug(name) }],
    _id: { $ne: skipId },
  }).select("_id");

  return Boolean(existRole);
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateRoleInfoByIdService(id, data) {
  return RoleModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Update icon by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateRoleIconByIdService(id, file, currentIcon) {
  if (currentIcon) {
    removeImageByPublicIdService(currentIcon);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: "role-icons",
  });

  return RoleModel.findByIdAndUpdate(
    id,
    {
      icon: result.public_id,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Update permissions by id
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function updateRolePermissionsByIdService(
  id,
  permissions = []
) {
  const result = await Promise.all(
    permissions.map(async (item) => {
      return getPermissionByIdService(item);
    })
  );

  return RoleModel.findByIdAndUpdate(
    id,
    {
      permissions: result.filter(Boolean),
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Activate role
 * @param {*} id
 * @returns
 */
export async function activateRoleByIdService(id) {
  return RoleModel.findByIdAndUpdate(
    id,
    {
      isActive: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Deactivate role
 * @param {*} id
 * @returns
 */
export async function deactivateRoleByIdService(id) {
  return RoleModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}
