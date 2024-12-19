import HttpStatus from "http-status-codes";
import {
  createPermissionService,
  getAllPermissionsService,
  getPermissionByIdService,
  removePermissionByIdService,
  updatePermissionInfoByIdService,
  checkExistPermissionNameService,
  countAllPermissionsService,
} from "#src/modules/permissions/permissions.service.js";
import {
  ConflictException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { calculatePagination } from "#src/utils/pagination.util";

export const createPermissionController = async (req, res) => {
  const { name } = req.body;
  const isExistName = await checkExistPermissionNameService(name);
  if (isExistName) {
    throw new ConflictException("Permission name already exist");
  }

  const newPermission = await createPermissionService(req.body);

  const formatterPermission = await getPermissionByIdService(
    newPermission._id
  );

  return res.json({
    statusCode: HttpStatus.CREATED,
    message: "Create permission successfully",
    data: formatterPermission,
  });
};

export const getAllPermissionsController = async (req, res) => {
  let { keyword = "", method, limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { module: { $regex: keyword, $options: "i" } },
      { endpoint: { $regex: keyword, $options: "i" } },
    ],
    ...(method ? { method } : {}),
  };

  const totalCount = await countAllPermissionsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const permissions = await getAllPermissionsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return res.json({
    statusCode: HttpStatus.OK,
    message: "Get all permissions successfully",
    data: { meta: metaData, list: permissions },
  });
};

export const getPermissionByIdController = async (req, res) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id);
  if (!existPermission) {
    throw new NotFoundException("Permission not found");
  }

  return res.json({
    statusCode: HttpStatus.OK,
    message: "Get one permission successfully",
    data: existPermission,
  });
};

export const updatePermissionByIdController = async (req, res) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id);
  if (!existPermission) {
    throw new NotFoundException("Permission not found");
  }

  const { name } = req.body;
  const isExistName = await checkExistPermissionNameService(name, id);
  if (isExistName) {
    throw new ConflictException("Permission name is exist");
  }

  const updatedPermission = await updatePermissionInfoByIdService(
    id,
    req.body
  );

  return res.json({
    statusCode: HttpStatus.OK,
    message: "Update permission successfully",
    data: updatedPermission,
  });
};

export const removePermissionByIdController = async (req, res) => {
  const { id } = req.params;
  const existPermission = await getPermissionByIdService(id);
  if (!existPermission) {
    throw new NotFoundException("Permission not found");
  }

  const removedPermission = await removePermissionByIdService(id);
  return res.json({
    statusCode: HttpStatus.OK,
    message: "Remove permission successfully",
    data: removedPermission,
  });
};
