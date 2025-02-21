import HttpStatus from 'http-status-codes';
import {
  getAllPermissionsService,
  getPermissionByIdService,
  removePermissionByIdService,
  updatePermissionInfoByIdService,
  checkExistPermissionNameService,
  countAllPermissionsService,
  activatePermissionByIdService,
  deactivatePermissionByIdService,
} from '#app/permissions/permissions.service';
import { ConflictException, NotFoundException, PreconditionFailedException } from '#core/exception/http-exception';
import { calculatePagination } from '#utils/pagination.util';

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

  return {
    statusCode: HttpStatus.OK,
    message: 'Get all permissions successfully',
    data: { meta: metaData, list: permissions },
  };
};

export const getPermissionByIdController = async (req) => {
  const { id } = req.params;
  const permission = await getPermissionByIdService(id);
  if (!permission) {
    throw new NotFoundException('Permission not found');
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'Get one permission successfully',
    data: permission,
  };
};

export const updatePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, '_id');
  if (!existPermission) {
    throw new NotFoundException('Permission not found');
  }

  const { name } = req.body;
  if (name) {
    const isExistName = await checkExistPermissionNameService(name, id);
    if (isExistName) {
      throw new ConflictException('Permission name is exist');
    }
  }

  const updatedPermission = await updatePermissionInfoByIdService(id, req.body);

  return {
    statusCode: HttpStatus.OK,
    message: 'Update permission successfully',
    data: updatedPermission,
  };
};

export const removePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, '_id');
  if (!existPermission) {
    throw new NotFoundException('Permission not found');
  }

  if (existPermission.isActive) {
    throw new PreconditionFailedException('Permission is active');
  }

  const removedPermission = await removePermissionByIdService(id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Remove permission successfully',
    data: removedPermission,
  };
};

export const isExistPermissionNameController = async (req) => {
  const { name } = req.body;
  const existPermissionName = await checkExistPermissionNameService(name);

  return {
    statusCode: HttpStatus.OK,
    message: existPermissionName ? 'Permission name exists' : 'Permission name does not exist',
    data: existPermissionName,
  };
};

export const activatePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, '_id');
  if (!existPermission) {
    throw new NotFoundException('Permission not found');
  }

  await activatePermissionByIdService(id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Activate permission successfully',
  };
};

export const deactivatePermissionByIdController = async (req) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id, '_id');
  if (!existPermission) {
    throw new NotFoundException('Permission not found');
  }

  await deactivatePermissionByIdService(id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Deactivate permission successfully',
  };
};
