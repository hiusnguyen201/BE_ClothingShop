import { HttpException } from '#src/core/exception/http-exception';
import {
  checkExistRoleNameRepository,
  getRoleByIdRepository,
  updateRoleInfoByIdRepository,
  createRoleRepository,
  getAndCountRolesRepository,
  removeRoleByIdRepository,
  addRolePermissionsRepository,
  getRolePermissionRepository,
  removeRolePermissionRepository,
} from '#src/app/roles/roles.repository';
import { Code } from '#src/core/code/Code';
import {
  getAndCountPermissionsRepository,
  getPermissionByIdRepository,
  getPermissionsRepository,
} from '#src/app/permissions/permissions.repository';
import {
  deleteRoleFromCache,
  getRoleFromCache,
  getRolesFromCache,
  setRoleToCache,
  setRolesToCache,
} from '#src/app/roles/roles.cache';
import { ROLE_SEARCH_FIELDS } from '#src/app/roles/roles.constant';
import { PERMISSION_SEARCH_FIELDS } from '#src/app/permissions/permissions.constant';
import { Assert } from '#src/core/assert/Assert';

/**
 * @typedef {import("#src/app/permissions/models/permission.model").PermissionModel} PermissionModel
 * @typedef {import("#src/app/roles/models/role.model").RoleModel} RoleModel
 * @typedef {import("#src/app/roles/dtos/check-exist-role-name.dto").CheckExistRoleNameDto} CheckExistRoleNamePort
 * @typedef {import("#src/app/roles/dtos/create-role.dto").CreateRoleDto} CreateRolePort
 * @typedef {import("#src/app/roles/dtos/get-list-role.dto").GetListRoleDto} GetListRolePort
 * @typedef {import("#src/app/roles/dtos/get-role.dto").GetRoleDto} GetRolePort
 * @typedef {import("#src/app/roles/dtos/update-role.dto").UpdateRoleDto} UpdateRolePort
 * @typedef {import("#src/app/roles/dtos/get-assigned-role-permissions.dto").GetAssignedRolePermissionsDto} GetAssignedRolePermissionsPort
 * @typedef {import("#src/app/roles/dtos/get-unassigned-role-permissions.dto").GetUnassignedRolePermissionsDto} GetUnassignedRolePermissionsPort
 * @typedef {import("#src/app/roles/dtos/add-role-permissions.dto").AddRolePermissionsDto} AddRolePermissionsPort
 * @typedef {import("#src/app/roles/dtos/remove-role-permission.dto").RemoveRolePermissionDto} RemoveRolePermissionPort
 */

/**
 * Check exist role name
 * @param {CheckExistRoleNamePort} payload
 * @returns {Promise<boolean>}
 */
export const checkExistRoleNameService = async (payload) => {
  return await checkExistRoleNameRepository(payload.name);
};

/**
 * Check exist role name
 * @param {CreateRolePort} payload
 * @returns {Promise<RoleModel>}
 */
export const createRoleService = async (payload) => {
  const isExistName = await checkExistRoleNameRepository(payload.name);
  Assert.isFalse(
    isExistName,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exists' }),
  );

  const role = await createRoleRepository(payload);

  // Clear cache
  await deleteRoleFromCache(role._id);

  return role;
};

/**
 * Get all roles
 * @param {GetListRolePort} payload
 * @returns {Promise<[number, RoleModel[]]>}
 */
export const getAllRolesService = async (payload) => {
  const filters = {
    $or: ROLE_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
  };

  const cached = await getRolesFromCache(payload);
  if (cached && Array.isArray(cached) && cached.length === 2 && cached[0] > 0) {
    return cached;
  }

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, roles] = await getAndCountRolesRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  await setRolesToCache(payload, totalCount, roles);

  return [totalCount, roles];
};

/**
 * Get role
 * @param {GetRolePort} payload
 * @returns {Promise<RoleModel>}
 */
export const getRoleByIdOrFailService = async (payload) => {
  const cached = await getRoleFromCache(payload.roleId);
  if (cached) return cached;

  const role = await getRoleByIdRepository(payload.roleId);
  Assert.isTrue(role, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));

  await setRoleToCache(payload.roleId, role);

  return role;
};

/**
 * Update role
 * @param {UpdateRolePort} payload
 * @returns {Promise<RoleModel>}
 */
export const updateRoleByIdOrFailService = async (payload) => {
  const role = await getRoleByIdRepository(payload.roleId);
  Assert.isTrue(role, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));

  const isExistName = await checkExistRoleNameRepository(payload.name, role._id);
  Assert.isFalse(
    isExistName,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exists' }),
  );

  const updatedRole = await updateRoleInfoByIdRepository(role._id, payload);

  // Clear cache
  await deleteRoleFromCache(role._id);

  return updatedRole;
};

/**
 * Remove role
 * @param {GetRolePort} payload
 * @returns {Promise<{id:string}>}
 */
export const removeRoleByIdOrFailService = async (payload) => {
  const role = await getRoleByIdRepository(payload.roleId);
  Assert.isTrue(role, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));

  await removeRoleByIdRepository(role._id);

  // Clear cache
  await deleteRoleFromCache(role._id);

  return { id: role._id };
};

// Uncache
/**
 * Get assigned role permissions
 * @param {GetAssignedRolePermissionsPort} payload
 * @returns {Promise<[number, PermissionModel[]]>}
 */
export const getGrantedPermissionsForRoleService = async (payload) => {
  const role = await getRoleByIdRepository(payload.roleId);
  Assert.isTrue(role, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));

  const filters = {
    $or: PERMISSION_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
    _id: { $in: role.permissions },
  };

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, permissions] = await getAndCountPermissionsRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  return [totalCount, permissions];
};

/**
 * Get unassigned role permissions
 * @param {GetUnassignedRolePermissionsPort} payload
 * @returns {Promise<[number, PermissionModel[]]>}
 */
export const getAvailablePermissionsForRoleService = async (payload) => {
  const role = await getRoleByIdRepository(payload.roleId);
  Assert.isTrue(role, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));

  const filters = {
    $or: ROLE_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
    _id: { $nin: role.permissions.map((item) => item._id) },
  };

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, permissions] = await getAndCountPermissionsRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  return [totalCount, permissions];
};

/**
 * Grant permissions to role
 * @param {AddRolePermissionsPort} payload
 * @returns {Promise<PermissionModel[]>}
 */
export const grantPermissionsToRoleService = async (payload) => {
  const role = await getRoleByIdRepository(payload.roleId);
  Assert.isTrue(role, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));

  const filters = {
    _id: { $in: payload.permissionIds },
  };

  const permissions = await getPermissionsRepository(filters);

  await addRolePermissionsRepository(
    role._id,
    permissions.filter(Boolean).map((item) => item._id),
  );

  return permissions;
};

/**
 * Revoke role permission
 * @param {RemoveRolePermissionPort} payload
 * @returns {Promise<{ id: string }>}
 */
export const revokeRolePermissionService = async (payload) => {
  const role = await getRolePermissionRepository(payload.roleId, payload.permissionId);
  Assert.isTrue(role, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' }));

  const permission = await getPermissionByIdRepository(payload.permissionId);
  Assert.isTrue(
    permission,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' }),
  );

  Assert.notEmpty(
    role.permissions,
    HttpException.new({
      code: Code.RESOURCE_NOT_FOUND,
      overrideMessage: 'Permission does not exist in the role',
    }),
  );

  await removeRolePermissionRepository(role._id, permission._id);

  return { id: permission._id };
};
