import { isValidObjectId } from 'mongoose';
import { RoleModel } from '#src/app/roles/models/role.model';
import { makeSlug } from '#src/utils/string.util';
import { REGEX_PATTERNS } from '#src/core/constant';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { ROLE_SELECTED_FIELDS } from '#src/app/roles/roles.constant';
import { PERMISSION_SELECTED_FIELDS } from '#src/app/permissions/permissions.constant';

/**
 * Create role
 * @param {*} data
 * @returns
 */
export async function createRoleService(data) {
  return RoleModel.create({ ...data, slug: makeSlug(data.name) });
}

/**
 * Get or create role with transaction
 * @param {*} data
 * @returns
 */
export async function getOrCreateRoleServiceWithTransaction(data, session) {
  const role = await RoleModel.findOne({ name: data.name }).lean();

  if (role) {
    if (data.permissions.length !== role.permissions.length) {
      return RoleModel.findByIdAndUpdate(role._id, { permissions: data.permissions });
    } else {
      return role;
    }
  }

  const [created] = await RoleModel.insertMany([{ ...data, slug: makeSlug(data.name) }], {
    session,
  });
  return created;
}

/**
 * Get all roles
 * @param {*} query
 * @returns
 */
export async function getAllRolesService(payload) {
  const { filters = {}, page, limit, sortBy, sortOrder } = payload;

  let queryOptions = {};
  queryOptions = extendQueryOptionsWithPagination({ page, limit }, queryOptions);
  queryOptions = extendQueryOptionsWithSort({ sortBy, sortOrder }, queryOptions);

  return RoleModel.find(filters, ROLE_SELECTED_FIELDS, queryOptions).lean();
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
 * @returns
 */
export async function getRoleByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return RoleModel.findOne(filter).select(ROLE_SELECTED_FIELDS).lean();
}

/**
 * Remove role by id
 * @param {*} id
 * @returns
 */
export async function removeRoleByIdService(id) {
  return RoleModel.findByIdAndSoftDelete(id).select('_id').lean();
}

/**
 * Check exist role name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistRoleNameService(name, skipId) {
  const filters = { $or: [{ name }, { slug: makeSlug(name) }] };

  if (skipId) {
    const key = isValidObjectId(skipId) ? '_id' : skipId.match(REGEX_PATTERNS.SLUG) ? 'slug' : null;
    if (key) filters[key] = { $ne: skipId };
  }

  const result = await RoleModel.findOne(filters, '_id', { withRemoved: true }).lean();
  return !!result;
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateRoleInfoByIdService(id, data) {
  if (data.name) {
    data.slug = makeSlug(data.name);
  }

  return RoleModel.findByIdAndUpdate(id, data, {
    new: true,
  })
    .select(ROLE_SELECTED_FIELDS)
    .lean();
}

/**
 * Get list role permission by id
 * @param {*} id
 * @returns
 */
export async function getListRolePermissionsByIdService(id, payload) {
  const filterRole = {};

  if (isValidObjectId(id)) {
    filterRole._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filterRole.slug = id;
  } else {
    filterRole.name = id;
  }

  const { filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = payload;

  const role = await RoleModel.findOne(filterRole)
    .populate({
      path: 'permissions',
      select: PERMISSION_SELECTED_FIELDS,
      ...(filters ? { match: filters } : {}),
      options: { limit, skip: (page - 1) * limit, sort: { [sortBy]: sortOrder } },
    })
    .select('permissions')
    .lean();

  return role.permissions;
}

/**
 * Update role permissions by id
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function updateRolePermissionsByIdService(id, permissionIds = []) {
  const role = await RoleModel.findByIdAndUpdate(
    id,
    {
      permissions: permissionIds.filter(Boolean),
    },
    { new: true },
  )
    .populate({
      path: 'permissions',
      select: PERMISSION_SELECTED_FIELDS,
    })
    .select('permissions')
    .lean();
  return role.permissions;
}
