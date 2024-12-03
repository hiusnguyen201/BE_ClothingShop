import { isValidObjectId } from "mongoose";
import { RoleModel } from "#src/modules/roles/schemas/role.schema";
import { ROLE_STATUS } from "#src/core/constant";
import {
  cropImagePathByVersion,
  uploadImageBuffer,
} from "#src/modules/cloudinary/cloudinary.service";

const SELECTED_FIELDS = "_id icon name description status";

export async function createRole(data) {  
  const role = await RoleModel.create({
    ...data,
    status: ROLE_STATUS.INACTIVE,
  });

  if (data?.file) {
    await updateRoleAvatarById(role._id, data.file);
  }

  return await findRoleById(role._id);
}

export async function findAllRoles(query, selectFields = SELECTED_FIELDS) {
  let { keyword = "", status, itemPerPage = 10, page = 1 } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ],
    [status && "status"]: status,
  };

  const totalItems = await RoleModel.countDocuments(filterOptions);
  const totalPages = Math.ceil(totalItems / itemPerPage);

  if (page <= 0 || !page) {
    page = 1;
  } else if (page > totalPages && totalPages >= 1) {
    page = totalPages;
  }

  const offSet = (page - 1) * itemPerPage;

  const roles = await RoleModel.find(filterOptions)
    .skip(offSet)
    .limit(itemPerPage)
    .select(selectFields);

  return {
    list: roles,
    meta: {
      offSet,
      itemPerPage,
      currentPage: page,
      totalPages,
      totalItems,
      isNext: page < totalPages,
      isPrevious: page > 1,
      isFirst: page > 1 && page <= totalPages,
      isLast: page >= 1 && page < totalPages,
    },
  };
}

export async function findRoleById(id, selectFields = SELECTED_FIELDS) {
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (typeof(id) === "string") {
    filter.name = id;
  } else {
    return null;
  }

  return await RoleModel.findOne(filter).select(selectFields);
}

export async function updateRoleById(id, data) {  
  const role = await RoleModel.findByIdAndUpdate(
    id,
    { ...data },
    { new: true }
  ).select(SELECTED_FIELDS);

  if (data?.file) {
    await updateRoleAvatarById(role._id, data.file);
  }

  return role;
}

export async function removeRoleById(id) {
  return await RoleModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

export async function checkExistedRoleById(id) {
  const existRole = await findRoleById(id, "_id");
  return Boolean(existRole);
}

export async function updateRoleAvatarById(id, file) {
  const folderName = "roles";
  const result = await uploadImageBuffer({
    file,
    folderName,
  });

  const cropImagePath = cropImagePathByVersion({
    url: result.url,
    version: result.version,
  });

  return await RoleModel.findByIdAndUpdate(
    id,
    {
      icon: cropImagePath,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}
