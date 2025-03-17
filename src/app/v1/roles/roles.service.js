import { isValidObjectId } from 'mongoose';
import { RoleModel } from '#src/models/role.model';
import { getPermissionByIdService } from '#src/app/v1/permissions/permissions.service';
import { makeSlug } from '#src/utils/string.util';
import { REGEX_PATTERNS } from '#src/core/constant';
import { ROLE_STATUS } from '#src/app/v1/roles/roles.constant';

/**
 * Create role
 * @param {*} data
 * @returns
 */
export async function createRoleService(data) {
  return RoleModel.create({ ...data, status: data.isActive ? ROLE_STATUS.ACTIVE : ROLE_STATUS.INACTIVE });
}

/**
 * Get or create role with transaction
 * @param {*} data
 * @returns
 */
export async function getOrCreateRoleServiceWithTransaction(data, session) {
  const role = await RoleModel.findOne({ name: data.name }).lean();

  if (role) {
    return role;
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
export async function getAllRolesService({ filters, offset, limit, sortBy, sortOrder }) {
  return RoleModel.find(filters)
    .skip(offset)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .lean();
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

  return RoleModel.findOne(filter).lean();
}

/**
 * Remove role by id
 * @param {*} id
 * @returns
 */
export async function removeRoleByIdService(id, removerId) {
  return RoleModel.findByIdAndSoftDelete(id, removerId).lean();
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
    filters._id = { $ne: skipId };
  }

  const result = await RoleModel.findOne(filters, '_id', { withRemoved: true }).lean();
  return !!result;
}

/**
 * Check exist role by id
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistRoleByIdService(id) {
  const result = await RoleModel.findOne({
    _id: id,
  }).select('_id');
  return !!result;
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
  }).lean();
}

/**
 * Update permissions by id
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function updateRolePermissionsByIdService(id, permissions = []) {
  const result = await Promise.all(
    permissions.map(async (item) => {
      return getPermissionByIdService(item);
    }),
  );

  return RoleModel.findByIdAndUpdate(
    id,
    {
      permissions: result.filter(Boolean),
    },
    { new: true },
  ).lean();
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
      status: ROLE_STATUS.ACTIVE,
    },
    { new: true },
  ).lean();
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
      status: ROLE_STATUS.INACTIVE,
    },
    { new: true },
  ).lean();
}
