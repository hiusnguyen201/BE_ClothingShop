import { getAllPermissionsService } from '#src/app/permissions/permissions.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PermissionDto } from '#src/app/permissions/dtos/permission.dto';
import { GetListPermissionDto } from '#src/app/permissions/dtos/get-list-permission.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { generatePermissionExcelBufferService } from '#src/modules/file-handler/excel/permission-excel.service';

export const getAllPermissionsController = async (req) => {
  const adapter = await validateSchema(GetListPermissionDto, req.query);

  const [totalCount, permissions] = await getAllPermissionsService(adapter);

  const permissionDto = ModelDto.newList(PermissionDto, permissions);
  return ApiResponse.success({ totalCount, list: permissionDto }, 'Get all permissions successful');
};

export const exportPermissionsController = async (req, res) => {
  const adapter = await validateSchema(GetListPermissionDto, req.query);

  const [_, permissions] = await getAllPermissionsService(adapter);

  const { buffer, fileName, contentType } = await generatePermissionExcelBufferService(permissions);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
};
