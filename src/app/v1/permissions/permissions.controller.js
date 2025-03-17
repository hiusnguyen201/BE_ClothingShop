'use strict';
import {
  getAllPermissionsService,
  getPermissionByIdService,
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
  const { permissionId } = req.params;
  const permission = await getPermissionByIdService(permissionId);
  if (!permission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  const permissionDto = ModelDto.new(PermissionDto, permission);
  return ApiResponse.success(permissionDto, 'Get one permission successfully');
};

export const updatePermissionByIdController = async (req) => {
  const { permissionId } = req.params;
  const { name } = req.body;

  const existPermission = await getPermissionByIdService(permissionId);
  if (!existPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  const isExistName = await checkExistPermissionNameService(name, permissionId);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Permission name is exist' });
  }

  const updatedPermission = await updatePermissionInfoByIdService(id, req.body);

  const permissionDto = ModelDto.new(PermissionDto, updatedPermission);
  return ApiResponse.success(permissionDto, 'Update permission successfully');
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
  const { permissionId } = req.params;
  const existPermission = await getPermissionByIdService(permissionId);
  if (!existPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  await activatePermissionByIdService(permissionId);

  return ApiResponse.success(true, 'Activate permission successfully');
};

export const deactivatePermissionByIdController = async (req) => {
  const { permissionId } = req.params;
  const existPermission = await getPermissionByIdService(permissionId);
  if (!existPermission) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Permission not found' });
  }

  await deactivatePermissionByIdService(permissionId);

  return ApiResponse.success(true, 'Deactivate permission successfully');
};
