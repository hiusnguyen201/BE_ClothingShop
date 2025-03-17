'use strict';
import {
  getAllPermissionsService,
  getPermissionByIdService,
  removePermissionByIdService,
  updatePermissionInfoByIdService,
  checkExistPermissionNameService,
  countAllPermissionsService,
  activatePermissionByIdService,
  deactivatePermissionByIdService,
} from '#src/app/v1/permissions/permissions.service';
import { HttpException } from '#src/core/exception/http-exception';
import { calculatePagination } from '#src/utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/v1/permissions/dtos/permission.dto';
import { Code } from '#src/core/code/Code';

export const getAllPermissionsController = async (req) => {
  let { keyword = '', method, limit = 10, page = 1, isActive } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { module: { $regex: keyword, $options: 'i' } },
      { endpoint: { $regex: keyword, $options: 'i' } },
    ],
    ...(method ? { method } : {}),
    ...(isActive ? { isActive } : {}),
  };

  const totalCount = await countAllPermissionsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const permissions = await getAllPermissionsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const permissionDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success({ meta: metaData, list: permissionDto }, 'Get all permissions successfully');
};

export const getPermissionByIdController = async (req) => {
  const { id } = req.params;
  const permission = await getPermissionByIdService(id);
  if (!permission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  const permissionDto = ModelDto.new(PermissionDto, permission);
  return ApiResponse.success(permissionDto, 'Get one permission successfully');
};

export const updatePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, 'id');
  if (!existPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  const { name } = req.body;
  if (name) {
    const isExistName = await checkExistPermissionNameService(name, id);
    if (isExistName) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Permission name is exist' });
    }
  }

  const updatedPermission = await updatePermissionInfoByIdService(id, req.body);

  const permissionDto = ModelDto.new(PermissionDto, updatedPermission);
  return ApiResponse.success(permissionDto, 'Update permission successfully');
};

export const removePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, 'id');
  if (!existPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  if (existPermission.isActive) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Permission is active' });
  }

  const removedPermission = await removePermissionByIdService(id);

  const permissionDto = ModelDto.new(PermissionDto, removedPermission);
  return ApiResponse.success(permissionDto, 'Remove permission successfully');
};

export const isExistPermissionNameController = async (req) => {
  const { name } = req.body;
  const existPermissionName = await checkExistPermissionNameService(name);

  return ApiResponse.success(
    existPermissionName,
    existPermissionName ? 'Permission name exists' : 'Permission name does not exist',
  );
};

export const activatePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, 'id');
  if (!existPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  await activatePermissionByIdService(id);

  return ApiResponse.success(true, 'Activate permission successfully');
};

export const deactivatePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, 'id');
  if (!existPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  await deactivatePermissionByIdService(id);

  return ApiResponse.success(true, 'Deactivate permission successfully');
};
