import { getAndCountPermissionsService } from '#src/app/permissions/permissions.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';
import { GetListPermissionDto } from '#src/app/permissions/dtos/get-list-permission.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { PERMISSION_SEARCH_FIELDS } from '#src/app/permissions/permissions.constant';
import {
  getTotalCountAndListPermissionFromCache,
  setTotalCountAndListPermissionToCache,
} from '#src/app/permissions/permissions-cache.service';

export const getAllPermissionsController = async (req) => {
  const adapter = await validateSchema(GetListPermissionDto, req.query);

  const filters = {
    $or: PERMISSION_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
  };

  let [totalCountCached, permissionsCached] = await getTotalCountAndListPermissionFromCache(adapter);

  if (permissionsCached.length === 0) {
    const skip = (adapter.page - 1) * adapter.limit;
    const [totalCount, permissions] = await getAndCountPermissionsService(
      filters,
      skip,
      adapter.limit,
      adapter.sortBy,
      adapter.sortOrder,
    );

    await setTotalCountAndListPermissionToCache(adapter, totalCount, permissions);

    totalCountCached = totalCount;
    permissionsCached = permissions;
  }

  const permissionDto = ModelDto.newList(PermissionDto, permissionsCached);
  return ApiResponse.success({ totalCount: totalCountCached, list: permissionDto }, 'Get all permissions successful');
};
