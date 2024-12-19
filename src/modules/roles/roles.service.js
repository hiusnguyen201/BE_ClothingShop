import { isValidObjectId } from "mongoose";
import { RoleModel } from "#src/modules/roles/schemas/role.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { getPermissionByIdService } from "#src/modules/permissions/permissions.service.js";
import { calculatePagination } from "#src/utils/pagination.util";
import { makeSlug } from "#src/utils/string.util";
import { REGEX_PATTERNS } from "#src/core/constant";

const SELECTED_FIELDS =
  "_id icon name slug description isActive createdAt updatedAt";

/**
 * Create role
 * @param {*} data
 * @returns
 */
export async function createRoleService(data) {
  return await RoleModel.create(data);
}

/**
 * Get all roles
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllRolesService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", status, limit = 10, page = 1 } = query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: "i" } }],
    [status && "status"]: status,
  };

  const totalCount = await RoleModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const roles = await RoleModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    meta: metaData,
    list: roles,
  };
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
  } else if (REGEX_PATTERNS.SLUG.test(id)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return await RoleModel.findOne(filter).select(selectFields);
}

/**
 * Remove role by id
 * @param {*} id
 * @returns
 */
export async function removeRoleByIdService(id) {
  return await RoleModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
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
  return await RoleModel.findByIdAndUpdate(id, data, {
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

  return await RoleModel.findByIdAndUpdate(
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
      return await getPermissionByIdService(item);
    })
  );

  return await RoleModel.findByIdAndUpdate(
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
export async function activateRoleService(id) {
  await RoleModel.findByIdAndUpdate(
    id,
    {
      isActive: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
  return;
}

/**
 * Deactivate role
 * @param {*} id
 * @returns
 */
export async function deactivateRoleService(id) {
  await RoleModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
  return;
}
