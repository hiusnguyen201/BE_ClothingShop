'use strict';
import { getAllPermissionsService, countAllPermissionsService } from '#src/app/permissions/permissions.service';
import { calculatePagination } from '#src/utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';

export const getAllPermissionsController = async (req) => {
  let { keyword, limit, page, sortBy, sortOrder } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { description: { $regex: keyword, $options: 'i' } }],
  };

  const totalCount = await countAllPermissionsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const permissions = await getAllPermissionsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
    sortBy,
    sortOrder,
  });

  const permissionDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success({ meta: metaData, list: permissionDto }, 'Get all permissions successfully');
};
