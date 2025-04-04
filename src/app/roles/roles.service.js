import { isValidObjectId, Types } from 'mongoose';
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
 * Get and count roles
 * @param {*} query
 * @returns
 */
export async function getAndCountRolesService(filters, skip, limit, sortBy, sortOrder) {
  const totalCount = await RoleModel.countDocuments(filters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await RoleModel.find(filters, ROLE_SELECTED_FIELDS, queryOptions).lean();

  return [totalCount, list];
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
  .lean();
}

/**
 * Get list role permissions
 * @param {string} roleId
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountRolePermissionsService(roleId, filters, skip, limit, sortBy, sortOrder) {
  const filterRole = {};

  if (isValidObjectId(roleId)) {
    filterRole._id = roleId;
  } else if (roleId.match(REGEX_PATTERNS.SLUG)) {
    filterRole.slug = roleId;
  } else {
    filterRole.name = roleId;
  }

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const role = await RoleModel.findOne(filterRole)
    .populate({
      path: 'permissions',
      select: PERMISSION_SELECTED_FIELDS,
      ...(filters ? { match: filters } : {}),
      options: queryOptions,
    })
    .select('permissions')
    .lean();

  const rolePermissions = await RoleModel.aggregate([
    { $match: { ...filterRole, ...(filterRole?._id ? { _id: new Types.ObjectId(filterRole._id) } : {}) } },
    {
      $lookup: {
        from: 'permissions',
        localField: 'permissions',
        foreignField: '_id',
        as: 'rolePermissions',
        pipeline: [{ $match: filters }],
      },
    },
    {
      $project: {
        _id: true,
        totalCount: {
          $size: '$rolePermissions',
        },
      },
    },
  ]);

  return [rolePermissions[0].totalCount, role.permissions];
}

/**
 * Get role permission
 * @param {string} roleId
 * @param {string} permissionId
 * @returns
 */
export async function getRolePermissionService(roleId, permissionId) {
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
 * Add role permission
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function addRolePermissionsService(roleId, permissionIds) {
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
 * Remove role permission
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function removeRolePermissionService(roleId, permissionId) {
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
