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
  activateRoleByIdService,
  deactivateRoleByIdService,
  countAllRolesService,
} from '#src/app/roles/roles.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { RoleDto } from '#src/app/roles/dtos/role.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { Code } from '#src/core/code/Code';
import { ROLE_STATUS } from '#src/app/roles/roles.constant';

export const createRoleController = async (req) => {
  const { name } = req.body;

  const isExistName = await checkExistRoleNameService(name);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exists' });
  }

  const newRole = await createRoleService(req.body);

  const roleDto = ModelDto.new(RoleDto, newRole);
  return ApiResponse.success(roleDto, 'Create role successfully');
};

export const getAllRolesController = async (req) => {
  const { keyword, limit, page, status, sortBy, sortOrder } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' }, description: { $regex: keyword, $options: 'i' } }],
    ...(status ? { status } : {}),
  };

  const totalCount = await countAllRolesService(filterOptions);

  const roles = await getAllRolesService({
    filters: filterOptions,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const rolesDto = ModelDto.newList(RoleDto, roles);
  return ApiResponse.success({ totalCount, list: rolesDto }, 'Get all roles successfully');
};

export const getRoleByIdController = async (req) => {
  const { roleId } = req.params;

  const role = await getRoleByIdService(roleId);
  if (!role) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const roleDto = ModelDto.new(RoleDto, role);
  return ApiResponse.success(roleDto, 'Get one role successfully');
};

export const updateRoleByIdController = async (req) => {
  const { roleId } = req.params;
  const { name } = req.body;

  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  if (name) {
    const isExistName = await checkExistRoleNameService(name, roleId);
    if (isExistName) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exist' });
    }
  }

  const updatedRole = await updateRoleInfoByIdService(roleId, req.body);

  const roleDto = ModelDto.new(RoleDto, updatedRole);
  return ApiResponse.success(roleDto, 'Update role successfully');
};

export const removeRoleByIdController = async (req) => {
  const { roleId } = req.params;
  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  if (existRole.status === ROLE_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Role is activate' });
  }

  await removeRoleByIdService(roleId);

  return ApiResponse.success(null, 'Remove role successfully');
};

export const isExistRoleNameController = async (req) => {
  const { name } = req.body;

  const existRoleName = await checkExistRoleNameService(name);

  return ApiResponse.success(existRoleName, existRoleName ? 'Role name exists' : 'Role name does not exist');
};

export const activateRoleByIdController = async (req) => {
  const { roleId } = req.params;
  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  if (existRole.status === ROLE_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Role is active' });
  }

  const updatedRole = await activateRoleByIdService(roleId);

  const roleDto = ModelDto.new(RoleDto, updatedRole);
  return ApiResponse.success(roleDto, 'Activate role successfully');
};

export const deactivateRoleByIdController = async (req) => {
  const { roleId } = req.params;
  const existRole = await getRoleByIdService(roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  if (existRole.status === ROLE_STATUS.INACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Role is inactive' });
  }

  const updatedRole = await deactivateRoleByIdService(roleId);

  const roleDto = ModelDto.new(RoleDto, updatedRole);
  return ApiResponse.success(roleDto, 'Deactivate role successfully');
};
