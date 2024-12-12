import { isValidObjectId } from "mongoose";
import { RoleModel } from "#src/modules/roles/schemas/role.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { findPermissionByIdService } from "#src/modules/permissions/permissions.service.js";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS = "_id icon name description status permissions";

/**
 * Create role
 * @param {*} data
 * @returns
 */
export async function createRoleService(data) {
  const { name, file, permissions } = data;

  const isExistName = await checkExistRoleNameService(name);
  if (isExistName) {
    throw new BadRequestException("Role is existed");
  }

  if (file) {
    const result = await uploadImageBufferService({
      file,
      folderName: "role-icons",
    });
    data.icon = result.public_id;
  }

  if (permissions && permissions.length > 0) {
    const result = await Promise.all(
      permissions.map(async (item) => {
        return await findPermissionByIdService(item);
      })
    );
    data.permissions = result.filter(Boolean);
  }

  const role = await RoleModel.create(data);

  return await findRoleByIdService(role._id);
}

/**
 * Find all roles
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function findAllRolesService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", status, limit = 10, page = 1 } = query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: "i" } }],
    [status && "status"]: status,
  };

  const totalCount = await RoleModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const roles = await RoleModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    list: roles,
    meta: metaData,
  };
}

/**
 * Find role by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function findRoleByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }

  return await RoleModel.findOne(filter).select(selectFields);
}

/**
 * Update role by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateRoleByIdService(id, data) {
  const { name, file, permissions } = data;
  const existRole = await findRoleByIdService(id, "_id icon");
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  if (name) {
    const isExistName = await checkExistRoleNameService(name, id);
    if (isExistName) {
      throw new BadRequestException("Role name is exist");
    }
  }

  if (file) {
    if (existRole) {
      removeImageByPublicIdService(existRole.icon);
    }
    const result = await uploadImageBufferService({
      file,
      folderName: "role-icons",
    });
    data.icon = result.public_id;
  }

  if (permissions && permissions.length > 0) {
    const result = await Promise.all(
      permissions.map(async (item) => {
        return await findPermissionByIdService(item);
      })
    );
    data.permissions = result.filter(Boolean);
  }

  return await RoleModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove role by id
 * @param {*} id
 * @returns
 */
export async function removeRoleByIdService(id) {
  const existRole = await findRoleByIdService(id, "_id");
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  return await RoleModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist role name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistRoleNameService(name, skipId) {
  const existRole = await RoleModel.findOne({
    name,
    _id: { $ne: skipId },
  }).select("_id");

  return Boolean(existRole);
}
