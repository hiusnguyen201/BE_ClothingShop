import { isValidObjectId, Types } from 'mongoose';
import { RoleModel } from '#src/app/roles/models/role.model';
import { makeSlug } from '#src/utils/string.util';
import { REGEX_PATTERNS } from '#src/core/constant';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { ROLE_SELECTED_FIELDS } from '#src/app/roles/roles.constant';
import { PERMISSION_SELECTED_FIELDS } from '#src/app/permissions/permissions.constant';

/**
 * Create a new role instance with a generated slug.
 * @param {RoleModel} data - The data to initialize the role with. Must include a `name` property for slug generation.
 * @returns {RoleModel} - A new, unsaved RoleModel instance.
 */
export function newRoleRepository(data) {
  data.slug = makeSlug(data.name);
  return new RoleModel(data);
}

/**
 * Insert a list of role instances into the database.
 * @param {RoleModel[]} data - An array of RoleModel instances to insert. Each should be a valid document.
 * @param {import('mongoose').ClientSession} [session] - Optional Mongoose session for transactional support.
 * @returns {Promise<RoleModel[]>} - The inserted role documents.
 */
export async function insertRolesRepository(data = [], session) {
  return await RoleModel.bulkSave(data, { session, ordered: true });
}

/**
 * Create and insert a new role into the database.
 * @param {{name:string, description}} data - Role data. Must include a `name` field for slug generation.
 * @returns {Promise<RoleModel>} - The created role document.
 */
export async function createRoleRepository(data) {
  return RoleModel.create({ ...data, slug: makeSlug(data.name) });
}

/**
 * Get and count roles
 * @param {Record<keyof RoleModel, any>} filters - Filters to apply when querying roles.
 * @param {number} skip - Number of documents to skip.
 * @param {number} limit - Maximum number of documents to return.
 * @param {keyof RoleModel} sortBy - Field to sort by.
 * @param {"asc" | "desc"} sortOrder - Sorting order (ascending or descending).
 * @returns {Promise<[total: number, data: RoleModel[]]>} - Total count and array of roles.
 */
export async function getAndCountRolesRepository(filters, skip, limit, sortBy, sortOrder) {
  const totalCount = await RoleModel.countDocuments(filters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await RoleModel.find(filters, ROLE_SELECTED_FIELDS, queryOptions).lean();

  return [totalCount, list];
}

/**
 * Retrieve a role by its ID, slug, or name.
 * @param {string} id - Can be a MongoDB ObjectId, slug, or role name.
 * @returns {Promise<RoleModel | null>} - The matching role document, or null if not found.
 */
export async function getRoleByIdRepository(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return RoleModel.findOne(filter).lean();
}

/**
 * Soft delete a role by its ID.
 * @param {string} id - The MongoDB ObjectId of the role to delete.
 * @returns {Promise<Pick<RoleModel, '_id'> | null>} - The deleted role's ID or null if not found.
 */
export async function removeRoleByIdRepository(id) {
  return RoleModel.findByIdAndSoftDelete(id).select('_id').lean();
}

/**
 * Check if a role with the given name or slug already exists, optionally skipping a specific ID.
 * @param {string} name - The name to check for uniqueness.
 * @param {string} [skipId] - An optional ID or slug to exclude from the check.
 * @returns {Promise<boolean>} - `true` if the name or slug exists, otherwise `false`.
 */
export async function checkExistRoleNameRepository(name, skipId) {
  const filters = { $or: [{ name }, { slug: makeSlug(name) }] };

  if (skipId) {
    const key = isValidObjectId(skipId) ? '_id' : skipId.match(REGEX_PATTERNS.SLUG) ? 'slug' : null;
    if (key) filters[key] = { $ne: skipId };
  }

  const result = await RoleModel.findOne(filters, '_id', { withRemoved: true }).lean();
  return !!result;
}

/**
 * Update a role's information by ID.
 *
 * @param {string} id - The MongoDB ObjectId of the role to update.
 * @param {Partial<RoleModel>} data - Partial role data to update. If `name` is provided, `slug` will be regenerated.
 * @returns {Promise<RoleModel | null>} - The updated role document, or null if not found.
 */
export async function updateRoleInfoByIdRepository(id, data) {
  if (data.name) {
    data.slug = makeSlug(data.name);
  }

  return RoleModel.findByIdAndUpdate(id, data, {
    new: true,
  }).lean();
}

/**
 * Get a specific permission assigned to a role.
 * @param {string} roleId - The ID of the role.
 * @param {string} permissionId - The ID of the permission to retrieve.
 * @returns {Promise<{ _id:string, permissions: PermissionModel[] } | null>} - Role with the matching permission, or null if not found.
 */
export async function getRolePermissionRepository(roleId, permissionId) {
  return RoleModel.findById(roleId)
    .populate({
      path: 'permissions',
      select: PERMISSION_SELECTED_FIELDS,
      match: { _id: permissionId },
    })
    .select('permissions')
    .lean();
}

/**
 * Add one or more permissions to a role.
 * @param {string} roleId - The ID of the role to update.
 * @param {string[]} permissionIds - Array of permission IDs to add.
 * @returns {Promise<{ _id:string, permissions: PermissionModel[] } | null>} - Updated role with permissions, or null if not found.
 */
export async function addRolePermissionsRepository(roleId, permissionIds) {
  return RoleModel.findByIdAndUpdate(
    roleId,
    {
      $addToSet: {
        permissions: { $each: permissionIds },
      },
    },
    { new: true },
  )
    .select('permissions')
    .lean();
}

/**
 * Remove a specific permission from a role.
 * @param {string} roleId - The ID of the role to update.
 * @param {string} permissionId - The ID of the permission to remove.
 * @returns {Promise<{ _id:string, permissions: PermissionModel[] } | null>} - Updated role with permissions, or null if not found.
 */
export async function removeRolePermissionRepository(roleId, permissionId) {
  return RoleModel.findByIdAndUpdate(
    roleId,
    {
      $pull: {
        permissions: permissionId,
      },
    },
    { new: true },
  )
    .select('permissions')
    .lean();
}
