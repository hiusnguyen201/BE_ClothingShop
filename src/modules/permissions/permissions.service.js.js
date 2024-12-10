import { isValidObjectId } from "mongoose";
import { PermissionModel } from "#src/modules/permissions/schemas/permission.schema";
import { BadRequestException } from "#src/core/exception/http-exception";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS =
  "_id name description module endpoint method status";

export async function createPermissionService(data) {
  const { name } = data;
  const isExistName = await checkExistPermissionNameService(name);
  if (isExistName) {
    throw new BadRequestException("Permission name is exist");
  }

  const permission = await PermissionModel.create(data);
  return await findPermissionByIdService(permission._id);
}

export async function findAllPermissionsService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", method, status, limit = 10, page = 1 } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { module: { $regex: keyword, $options: "i" } },
      { endpoint: { $regex: keyword, $options: "i" } },
    ],
    [method && "method"]: method,
    [status && "status"]: status,
  };

  const totalCount = await PermissionModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const permissions = await PermissionModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields);

  return {
    list: permissions,
    meta: metaData,
  };
}

export async function findPermissionByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }

  return await PermissionModel.findOne(filter).select(selectFields);
}

export async function updatePermissionByIdService(id, data) {
  const { name } = data;
  const isExistName = await checkExistPermissionNameService(name);
  if (isExistName) {
    throw new BadRequestException("Permission name is exist");
  }

  const permission = await PermissionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);

  return permission;
}

export async function removePermissionByIdService(id) {
  return await PermissionModel.findByIdAndDelete(id).select(
    SELECTED_FIELDS
  );
}

export async function checkExistPermissionNameService(name, skipId) {
  const existRole = await PermissionModel.findOne({
    name,
    _id: { $ne: skipId },
  }).select("name");
  return Boolean(existRole);
}
