'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import {
  createRoleService,
  getAllRolesService,
  getRoleByIdService,
  removeRoleByIdService,
  updateRolePermissionsByIdService,
  updateRoleInfoByIdService,
  checkExistRoleNameService,
  countAllRolesService,
  getListRolePermissionsByIdService,
} from '#src/app/roles/roles.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { RoleDto } from '#src/app/roles/dtos/role.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { Code } from '#src/core/code/Code';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';
import { countAllPermissionsService, getAllPermissionsService } from '#src/app/permissions/permissions.service';

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
  const { keyword, limit, page, sortBy, sortOrder } = req.query;

  const filters = {
    $or: [
      {
        name: { $regex: keyword, $options: 'i' },
      },
      {
        description: { $regex: keyword, $options: 'i' },
      },
    ],
  };

  const totalCount = await countAllRolesService(filters);

  const roles = await getAllRolesService({
    filters: filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

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

  if (name) {
    const isExistName = await checkExistRoleNameService(name, existRole._id);
    if (isExistName) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exist' });
    }
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

export const getListRolePermissionsController = async (req) => {
  const { keyword, limit, page, sortBy, sortOrder, roleId } = req.query;
  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const filters = {
    $or: [
      {
        name: { $regex: keyword, $options: 'i' },
      },
      {
        description: { $regex: keyword, $options: 'i' },
      },
      {
        modules: { $regex: keyword, $options: 'i' },
      },
    ],
  };

  const permissions = await getListRolePermissionsByIdService(existRole._id, {
    filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const totalCount = await countAllPermissionsService({ _id: { $in: existRole.permissions }, ...filters });

  const permissionsDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success({ totalCount, list: permissionsDto }, 'Get all permissions successful');
};

export const updateListRolePermissionsController = async (req) => {
  const { roleId, permissionIds } = req.body;
  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const filters = {
    _id: { $in: permissionIds },
  };

  const permissions = await getAllPermissionsService({ filters });

  const updatedRolePermissions = await updateRolePermissionsByIdService(
    existRole._id,
    permissions.map((p) => p?._id),
  );

  const permissionsDto = ModelDto.newList(PermissionDto, updatedRolePermissions);
  return ApiResponse.success(permissionsDto, 'Update role permissions successful');
};
