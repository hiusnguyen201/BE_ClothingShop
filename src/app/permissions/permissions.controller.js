import { getAndCountPermissionsService } from '#src/app/permissions/permissions.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';
import { GetListPermissionDto } from '#src/app/permissions/dtos/get-list-permission.dto';
import { validateSchema } from '#src/core/validations/request.validation';

export const getAllPermissionsController = async (req) => {
  const adapter = await validateSchema(GetListPermissionDto, req.query);

  const searchFields = ['name', 'description', 'module'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, permissions] = await getAndCountPermissionsService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const permissionDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success({ totalCount, list: permissionDto }, 'Get all permissions successful');
};
