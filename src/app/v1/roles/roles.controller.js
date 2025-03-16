import { ConflictException, NotFoundException, PreconditionFailedException } from '#src/core/exception/http-exception';
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
} from '#src/app/v1/roles/roles.service';
import { makeSlug } from '#src/utils/string.util';
import { calculatePagination } from '#src/utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { RoleDto } from '#src/app/v1/roles/dtos/role.dto';
import { ModelDto } from '#src/core/dto/ModelDto';

export const createRoleController = async (req) => {
  const { name, permissions } = req.body;
  const isExistName = await checkExistRoleNameService(name);
  if (isExistName) {
    throw new ConflictException('Role name already exist');
  }

  const newRole = await createRoleService({
    ...req.body,
    slug: makeSlug(name),
  });

  // Update permissions
  if (permissions && permissions.length > 0) {
    await updateRolePermissionsByIdService(newRole._id, permissions);
  }

  const roleDto = ModelDto.new(RoleDto, newRole);
  return ApiResponse.success(roleDto, 'Create role successfully');
};

export const getAllRolesController = async (req) => {
  let { keyword = '', limit = 10, page = 1, isActive } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }],
    ...(isActive ? { isActive } : {}),
  };

  const totalCount = await countAllRolesService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const roles = await getAllRolesService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const rolesDto = ModelDto.newList(RoleDto, roles);
  return ApiResponse.success({ meta: metaData, list: rolesDto }, 'Get all roles successfully');
};

export const getRoleByIdController = async (req) => {
  const { id } = req.params;
  const role = await getRoleByIdService(id);
  if (!role) {
    throw new NotFoundException('Role not found');
  }

  const roleDto = ModelDto.newList(RoleDto, role);
  return ApiResponse.success(roleDto, 'Get one role successfully');
};

export const updateRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id, 'id');
  if (!existRole) {
    throw new NotFoundException('Role not found');
  }

  const { name, permissions } = req.body;
  if (name) {
    const isExistName = await checkExistRoleNameService(name, id);
    if (isExistName) {
      throw new ConflictException('Role name already exist');
    }
    req.body.slug = makeSlug(name);
  }

  // Update basic info
  let updatedRole = await updateRoleInfoByIdService(id, req.body);

  // Update permissions
  if (permissions && permissions.length > 0) {
    updatedRole = await updateRolePermissionsByIdService(id, permissions);
  }

  const roleDto = ModelDto.newList(RoleDto, updatedRole);
  return ApiResponse.success(roleDto, 'Update role successfully');
};

export const removeRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id);
  if (!existRole) {
    throw new NotFoundException('Role not found');
  }

  if (existRole.isActive) {
    throw new PreconditionFailedException('Role is active');
  }

  const removedRole = await removeRoleByIdService(id);

  const roleDto = ModelDto.newList(RoleDto, removedRole);
  return ApiResponse.success(roleDto, 'Remove role successfully');
};

export const isExistRoleNameController = async (req) => {
  const { name } = req.body;
  const existRoleName = await checkExistRoleNameService(name);

  return ApiResponse.success(existRoleName, existRoleName ? 'Role name exists' : 'Role name does not exist');
};

export const activateRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id, 'id');
  if (!existRole) {
    throw new NotFoundException('Role not found');
  }

  await activateRoleByIdService(id);

  return ApiResponse.success(true, 'Activate role successfully');
};

export const deactivateRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id, 'id');
  if (!existRole) {
    throw new NotFoundException('Role not found');
  }

  await deactivateRoleByIdService(id);

  return ApiResponse.success(true, 'Deactivate role successfully');
};
