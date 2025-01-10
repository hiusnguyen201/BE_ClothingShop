import HttpStatus from "http-status-codes";
import {
  ConflictException,
  NotFoundException,
  PreconditionFailedException,
} from "#src/core/exception/http-exception";
import {
  createRoleService,
  getAllRolesService,
  getRoleByIdService,
  removeRoleByIdService,
  updateRolePermissionsByIdService,
  updateRoleIconByIdService,
  updateRoleInfoByIdService,
  checkExistRoleNameService,
  activateRoleByIdService,
  deactivateRoleByIdService,
  countAllRolesService,
} from "#src/modules/roles/roles.service";
import { makeSlug } from "#src/utils/string.util";
import { calculatePagination } from "#src/utils/pagination.util";

export const createRoleController = async (req) => {
  const { name, permissions } = req.body;
  const isExistName = await checkExistRoleNameService(name);
  if (isExistName) {
    throw new ConflictException("Role name already exist");
  }

  const newRole = await createRoleService({
    ...req.body,
    slug: makeSlug(name),
  });

  // Update permissions
  if (permissions && permissions.length > 0) {
    await updateRolePermissionsByIdService(newRole._id, permissions);
  }

  // Update icon
  if (req.file) {
    await updateRoleIconByIdService(newRole._id, req.file);
  }

  const formatterRole = await getRoleByIdService(newRole._id);

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create role successfully",
    data: formatterRole,
  };
};

export const getAllRolesController = async (req) => {
  let { keyword = "", limit = 10, page = 1, isActive } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: "i" } }],
    ...(isActive ? { isActive } : {}),
  };

  const totalCount = await countAllRolesService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const roles = await getAllRolesService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all roles successfully",
    data: { meta: metaData, list: roles },
  };
};

export const getRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id);
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one role successfully",
    data: existRole,
  };
};

export const updateRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id, "_id");
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  const { name, permissions } = req.body;
  if (name) {
    const isExistName = await checkExistRoleNameService(name, id);
    if (isExistName) {
      throw new ConflictException("Role name already exist");
    }
    req.body.slug = makeSlug(name);
  }

  // Update basic info
  let updatedRole = await updateRoleInfoByIdService(id, req.body);

  // Update icon
  if (req.file) {
    updatedRole = await updateRoleIconByIdService(
      id,
      req.file,
      updatedRole?.icon
    );
  }

  // Update permissions
  if (permissions && permissions.length > 0) {
    updatedRole = await updateRolePermissionsByIdService(id, permissions);
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Update role successfully",
    data: updatedRole,
  };
};

export const removeRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id);
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  if (existRole.isActive) {
    throw new PreconditionFailedException("Role is active");
  }

  const data = await removeRoleByIdService(id);
  return {
    statusCode: HttpStatus.OK,
    message: "Remove role successfully",
    data,
  };
};

export const isExistRoleNameController = async (req) => {
  const { name } = req.body;
  const existRoleName = await checkExistRoleNameService(name);

  return {
    statusCode: HttpStatus.OK,
    message: existRoleName
      ? "Role name exists"
      : "Role name does not exist",
    data: existRoleName,
  };
};

export const activateRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id, "_id");
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  await activateRoleByIdService(id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: "Activate role successfully",
  };
};

export const deactivateRoleByIdController = async (req) => {
  const { id } = req.params;
  const existRole = await getRoleByIdService(id, "_id");
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  await deactivateRoleByIdService(id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: "Deactivate role successfully",
  };
};
