import { isValidObjectId } from "mongoose";
import { RoleModel } from "#src/modules/roles/schemas/role.schema";
import {
  removeImages,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { findPermissionByIdService } from "#src/modules/permissions/permissions.service.js";

const SELECTED_FIELDS = "_id icon name description status permissions";
const FOLDER_ICONS = "icons";

export async function createRoleService(data) {
  const { name, file, permissions } = data;

  const isExistName = await checkExistNameService(name);
  if (isExistName) {
    throw new BadRequestException("Role not found");
  }

  const role = await RoleModel.create(data);

  if (permissions && permissions.length > 0) {
    const result = await Promise.all(
      permissions.map(async (item) => {
        return await findPermissionByIdService(item);
      })
    );
    role.permissions = result.filter(Boolean);
    await role.save();
  }

  if (file) {
    await updateRoleIconByIdService(role._id, file);
  }
  return await findRoleByIdService(role._id);
}

export async function findAllRolesService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", status, itemPerPage = 10, page = 1 } = query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: "i" } }],
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

export async function updateRoleByIdService(id, data) {
  const { name, file, permissions } = data;
  if (name) {
    const isExistName = await checkExistNameService(name);
    if (isExistName) {
      throw new BadRequestException("Role name is exist");
    }
  }

  const existRole = await findRoleByIdService(id, "_id");
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  const role = await RoleModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);

  if (permissions && permissions.length > 0) {
    const result = await Promise.all(
      permissions.map(async (item) => {
        return await findPermissionByIdService(item);
      })
    );
    role.permissions = result.filter(Boolean);
    await role.save();
  }

  if (file) {
    await removeImages(FOLDER_ICONS + `/${id}`);
    await updateRoleIconByIdService(role._id, file);
  }

  return await findRoleByIdService(role._id);
}

export async function removeRoleByIdService(id) {
  const existRole = await findRoleByIdService(id, "_id");
  if (!existRole) {
    throw new NotFoundException("Role not found");
  }

  return await RoleModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

export async function updateRoleIconByIdService(id, file) {
  const folderName = `${FOLDER_ICONS}/${id}`;
  const result = await uploadImageBufferService({
    file,
    folderName,
  });

  return await RoleModel.findByIdAndUpdate(
    id,
    {
      icon: result.url,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

export async function checkExistNameService(name, skipId) {
  const existRole = await RoleModel.findOne({
    name,
    _id: { $ne: skipId },
  }).select("name");
  return Boolean(existRole);
}
