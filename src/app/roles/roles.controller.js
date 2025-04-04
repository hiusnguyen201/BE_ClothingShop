'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import {
  createRoleService,
  getRoleByIdService,
  removeRoleByIdService,
  updateRoleInfoByIdService,
  checkExistRoleNameService,
  getAndCountRolePermissionsService,
  addRolePermissionsService,
  removeRolePermissionService,
  getRolePermissionService,
  getAndCountRolesService,
} from '#src/app/roles/roles.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { RoleDto } from '#src/app/roles/dtos/role.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { Code } from '#src/core/code/Code';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';
import {
  getAndCountPermissionsService,
  getPermissionByIdService,
  getPermissionsService,
} from '#src/app/permissions/permissions.service';

export const createRoleController = async (req) => {
  const { name } = req.body;

  const isExistName = await checkExistRoleNameService(name);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exists' });
  }

  const newRole = await createRoleService(req.body);

  const roleDto = ModelDto.new(RoleDto, newRole);
  return ApiResponse.success(roleDto, 'Create role successful');
};

export const getAllRolesController = async (req) => {
  const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const searchFields = ['name', 'description'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    })),
  };

  const skip = (page - 1) * limit;
  const [totalCount, roles] = await getAndCountRolesService(filters, skip, limit, sortBy, sortOrder);

  const rolesDto = ModelDto.newList(RoleDto, roles);

  return ApiResponse.success({ totalCount, list: rolesDto }, 'Get all roles successful');
};

export const getRoleByIdController = async (req) => {
  const { roleId } = req.params;

  const role = await getRoleByIdService(roleId);
  if (!role) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const roleDto = ModelDto.new(RoleDto, role);
  return ApiResponse.success(roleDto, 'Get one role successful');
};

export const updateRoleByIdController = async (req) => {
  const { roleId } = req.params;
  const { name } = req.body;

  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const isExistName = await checkExistRoleNameService(name, existRole._id);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exist' });
  }

  const updatedRole = await updateRoleInfoByIdService(existRole._id, req.body);

  const roleDto = ModelDto.new(RoleDto, updatedRole);
  return ApiResponse.success(roleDto, 'Edit role successful');
};

export const removeRoleByIdController = async (req) => {
  const { roleId } = req.params;
  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  await removeRoleByIdService(roleId);

  return ApiResponse.success({ id: existRole._id }, 'Remove role successful');
};

export const isExistRoleNameController = async (req) => {
  const { name } = req.body;

  const existRoleName = await checkExistRoleNameService(name);

  return ApiResponse.success(existRoleName, existRoleName ? 'Role name exists' : 'Role name does not exist');
};

export const getRolePermissionsController = async (req) => {
  const { roleId } = req.params;
  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const searchFields = ['name', 'description', 'module'];
  const assignedFilters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    })),
  };

  const skip = (page - 1) * limit;
  const [assignedTotalCount, assignedPermissions] = await getAndCountRolePermissionsService(
    roleId,
    assignedFilters,
    skip,
    limit,
    sortBy,
    sortOrder,
  );

  const unassignedFilters = {
    _id: { $nin: existRole.permissions.map((item) => item._id) },
  };
  const [unassignedTotalCount, unassignedPermissions] = await getAndCountPermissionsService(
    unassignedFilters,
    skip,
    limit,
    sortBy,
    sortOrder,
  );

  const assignedPermissionsDto = ModelDto.newList(PermissionDto, assignedPermissions);
  const unassignedPermissionsDto = ModelDto.newList(PermissionDto, unassignedPermissions);
  return ApiResponse.success(
    {
      assignedTotalCount,
      assignedList: assignedPermissionsDto,
      unassignedTotalCount,
      unassignedList: unassignedPermissionsDto,
    },
    'Get all role permissions successful',
  );
};

export const addRolePermissionsController = async (req) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;

  const role = await getRoleByIdService(roleId);
  if (!role) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const filters = {
    _id: { $in: permissionIds },
  };

  const permissions = await getPermissionsService(filters);

  await addRolePermissionsService(
    role._id,
    permissions.filter(Boolean).map((item) => item._id),
  );

  const permissionsDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success(permissionsDto, 'Add role permissions successful');
};

export const removeRolePermissionController = async (req) => {
  const { roleId, permissionId } = req.params;

  const rolePermission = await getRolePermissionService(roleId, permissionId);
  if (!rolePermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const permission = await getPermissionByIdService(permissionId);
  if (!permission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  if (rolePermission.permissions.length === 0) {
    throw HttpException.new({
      code: Code.RESOURCE_NOT_FOUND,
      overrideMessage: 'Permission does not exist in the role',
    });
  }

  await removeRolePermissionService(rolePermission._id, permission._id);

  return ApiResponse.success({ id: permission._id }, 'Remove role permission successful');
};
