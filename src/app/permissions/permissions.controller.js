'use strict';
import { getAllPermissionsService, countAllPermissionsService } from '#src/app/permissions/permissions.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';

export const getAllPermissionsController = async (req) => {
  let { keyword, limit, page, sortBy, sortOrder } = req.query;

  const filters = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { description: { $regex: keyword, $options: 'i' } }],
  };

  const totalCount = await countAllPermissionsService(filters);

  const permissions = await getAllPermissionsService({
    filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const permissionDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success({ totalCount, list: permissionDto }, 'Get all permissions successful');
};
