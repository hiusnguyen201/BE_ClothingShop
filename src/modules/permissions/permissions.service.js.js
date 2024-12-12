import { isValidObjectId } from "mongoose";
import { PermissionModel } from "#src/modules/permissions/schemas/permission.schema";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS =
  "_id name description module endpoint method status createdAt updatedAt";

/**
 * Create permission
 * @param {*} data
 * @returns
 */
export async function createPermissionService(data) {
  return await PermissionModel.create(data);
}

/**
 * Get all permissions
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllPermissionsService(
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
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    meta: metaData,
    list: permissions,
  };
}

/**
 * Get permission by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getPermissionByIdService(
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

/**
 * Update permission info by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updatePermissionInfoByIdService(id, data) {
  return await PermissionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove permission by id
 * @param {*} id
 * @returns
 */
export async function removePermissionByIdService(id) {
  return await PermissionModel.findByIdAndDelete(id).select(
    SELECTED_FIELDS
  );
}

/**
 * Check exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistPermissionNameService(name, skipId) {
  const existRole = await PermissionModel.findOne({
    name,
    _id: { $ne: skipId },
  }).select("_id");
  return Boolean(existRole);
}
