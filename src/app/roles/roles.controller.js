import {
  checkExistRoleNameService,
  createRoleService,
  getRoleByIdOrFailService,
  removeRoleByIdOrFailService,
  updateRoleByIdOrFailService,
  grantPermissionsToRoleService,
  revokeRolePermissionService,
  getAllRolesService,
  getGrantedPermissionsForRoleService,
  getAvailablePermissionsForRoleService,
} from '#src/app/roles/roles.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { RoleDto } from '#src/app/roles/dtos/role.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';
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
import { generateRoleExcelBufferService } from '#src/modules/file-handler/excel/role-excel.service';

export const isExistRoleNameController = async (req) => {
  const adapter = await validateSchema(CheckExistRoleNameDto, req.body);

  const existRoleName = await checkExistRoleNameService(adapter);

  return ApiResponse.success(existRoleName, existRoleName ? 'Role name exists' : 'Role name does not exist');
};

export const createRoleController = async (req) => {
  const adapter = await validateSchema(CreateRoleDto, req.body);

  const role = await createRoleService(adapter);

  const roleDto = ModelDto.new(RoleDto, role);
  return ApiResponse.success(roleDto, 'Create role successful');
};

export const getAllRolesController = async (req) => {
  const adapter = await validateSchema(GetListRoleDto, req.query);

  const [totalCount, roles] = await getAllRolesService(adapter);

  const rolesDto = ModelDto.newList(RoleDto, roles);
  return ApiResponse.success({ totalCount, list: rolesDto }, 'Get all roles successful');
};

export const exportRolesController = async (req, res) => {
  const adapter = await validateSchema(GetListRoleDto, req.query);

  const [_, roles] = await getAllRolesService(adapter);

  const { buffer, fileName, contentType } = await generateRoleExcelBufferService(roles);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
};

export const getRoleByIdController = async (req) => {
  const adapter = await validateSchema(GetRoleDto, req.params);

  const role = await getRoleByIdOrFailService(adapter);

  const roleDto = ModelDto.new(RoleDto, role);
  return ApiResponse.success(roleDto, 'Get one role successful');
};

export const updateRoleByIdController = async (req) => {
  const adapter = await validateSchema(UpdateRoleDto, { ...req.body, ...req.params });

  const updatedRole = await updateRoleByIdOrFailService(adapter);

  const roleDto = ModelDto.new(RoleDto, updatedRole);
  return ApiResponse.success(roleDto, 'Edit role successful');
};

export const removeRoleByIdController = async (req) => {
  const adapter = await validateSchema(GetRoleDto, req.params);

  const data = await removeRoleByIdOrFailService(adapter);

  return ApiResponse.success(data, 'Remove role successful');
};

// Uncache
export const getAssignedRolePermissionsController = async (req) => {
  const adapter = await validateSchema(GetAssignedRolePermissionsDto, { ...req.params, ...req.query });

  const [totalCount, permissions] = await getGrantedPermissionsForRoleService(adapter);

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

  const [totalCount, permissions] = await getAvailablePermissionsForRoleService(adapter);

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

  const permissions = await grantPermissionsToRoleService(adapter);

  const permissionsDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success(permissionsDto, 'Add role permissions successful');
};

export const removeRolePermissionController = async (req) => {
  const adapter = await validateSchema(RemoveRolePermissionDto, req.params);

  const data = await revokeRolePermissionService(adapter);

  return ApiResponse.success(data, 'Remove role permission successful');
};
