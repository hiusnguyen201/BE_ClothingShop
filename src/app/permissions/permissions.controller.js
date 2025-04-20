import { getAndCountPermissionsService } from '#src/app/permissions/permissions.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';

export const getAllPermissionsController = async (req) => {
  const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const searchFields = ['name', 'description', 'module'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    })),
  };

  const skip = (page - 1) * limit;
  const [totalCount, permissions] = await getAndCountPermissionsService(filters, skip, limit, sortBy, sortOrder);

  const permissionDto = ModelDto.newList(PermissionDto, permissions);

  return ApiResponse.success({ totalCount, list: permissionDto }, 'Get all permissions successful');
};
