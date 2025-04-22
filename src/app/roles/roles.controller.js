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
import { validateSchema } from '#src/core/validations/request.validation';
import { CreateRoleDto } from '#src/app/roles/dtos/create-role.dto';
import { GetListRoleDto } from '#src/app/roles/dtos/get-list-role.dto';
import { GetRoleDto } from '#src/app/roles/dtos/get-role.dto';
import { CheckExistRoleNameDto } from '#src/app/roles/dtos/check-exist-role-name.dto';
import { GetAssignedRolePermissionsDto } from '#src/app/roles/dtos/get-assigned-role-permissions.dto';
import { RemoveRolePermissionDto } from '#src/app/roles/dtos/remove-role-permission.dto';
import { AddRolePermissionsDto } from '#src/app/roles/dtos/add-role-permissions.dto';
import { GetUnassignedRolePermissionsDto } from '#src/app/roles/dtos/get-unassigned-role-permissions.dto';
import { UpdateRoleDto } from '#src/app/roles/dtos/update-role.dto';

export const createRoleController = async (req) => {
  const adapter = await validateSchema(CreateRoleDto, req.body);

  const isExistName = await checkExistRoleNameService(adapter.name);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exists' });
  }

  const newRole = await createRoleService(adapter);

  const roleDto = ModelDto.new(RoleDto, newRole);
  return ApiResponse.success(roleDto, 'Create role successful');
};

export const getAllRolesController = async (req) => {
  const adapter = await validateSchema(GetListRoleDto, req.query);

  const searchFields = ['name', 'description'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, roles] = await getAndCountRolesService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const rolesDto = ModelDto.newList(RoleDto, roles);

  return ApiResponse.success({ totalCount, list: rolesDto }, 'Get all roles successful');
};

export const getRoleByIdController = async (req) => {
  const adapter = await validateSchema(GetRoleDto, req.params);

  const role = await getRoleByIdService(adapter.roleId);
  if (!role) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const roleDto = ModelDto.new(RoleDto, role);
  return ApiResponse.success(roleDto, 'Get one role successful');
};

export const updateRoleByIdController = async (req) => {
  const adapter = await validateSchema(UpdateRoleDto, { ...req.body, ...req.params });

  const existRole = await getRoleByIdService(adapter.roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const isExistName = await checkExistRoleNameService(adapter.name, existRole._id);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Role name already exist' });
  }

  const updatedRole = await updateRoleInfoByIdService(existRole._id, adapter);

  const roleDto = ModelDto.new(RoleDto, updatedRole);
  return ApiResponse.success(roleDto, 'Edit role successful');
};

export const removeRoleByIdController = async (req) => {
  const adapter = await validateSchema(GetRoleDto, req.params);

  const existRole = await getRoleByIdService(adapter.roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  await removeRoleByIdService(existRole._id);

  return ApiResponse.success({ id: existRole._id }, 'Remove role successful');
};

export const isExistRoleNameController = async (req) => {
  const adapter = await validateSchema(CheckExistRoleNameDto, req.body);

  const existRoleName = await checkExistRoleNameService(adapter.name);

  return ApiResponse.success(existRoleName, existRoleName ? 'Role name exists' : 'Role name does not exist');
};

export const getAssignedRolePermissionsController = async (req) => {
  const adapter = await validateSchema(GetAssignedRolePermissionsDto, { ...req.params, ...req.query });

  const existRole = await getRoleByIdService(adapter.roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const searchFields = ['name', 'description', 'module'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, permissions] = await getAndCountRolePermissionsService(
    existRole._id,
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const permissionsDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success(
    {
      totalCount,
      list: permissionsDto,
    },
    'Get all assigned role permissions successful',
  );
};

export const getUnassignedRolePermissionsController = async (req) => {
  const adapter = await validateSchema(GetUnassignedRolePermissionsDto, { ...req.params, ...req.query });

  const existRole = await getRoleByIdService(adapter.roleId);
  if (!existRole) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const searchFields = ['name', 'description', 'module'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
    _id: { $nin: existRole.permissions.map((item) => item._id) },
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, permissions] = await getAndCountPermissionsService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const permissionsDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success(
    {
      totalCount,
      list: permissionsDto,
    },
    'Get all unassigned role permissions successful',
  );
};

export const addRolePermissionsController = async (req) => {
  const adapter = await validateSchema(AddRolePermissionsDto, { ...req.body, ...req.params });

  const role = await getRoleByIdService(adapter.roleId);
  if (!role) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const filters = {
    _id: { $in: adapter.permissionIds },
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
  const adapter = await validateSchema(RemoveRolePermissionDto, req.params);

  const rolePermission = await getRolePermissionService(adapter.roleId, adapter.permissionId);
  if (!rolePermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Role not found' });
  }

  const permission = await getPermissionByIdService(adapter.permissionId);
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
