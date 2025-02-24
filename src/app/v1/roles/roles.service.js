import { isValidObjectId } from 'mongoose';
import { RoleModel } from '#src/models/role.model';
import { removeImageByPublicIdService, uploadImageBufferService } from '#src/modules/cloudinary/CloudinaryService';
import { getPermissionByIdService } from '#src/app/v1/permissions/permissions.service';
import { makeSlug } from '#utils/string.util';
import { REGEX_PATTERNS } from '#core/constant';

/**
 * Create role
 * @param {*} data
 * @returns
 */
export async function createRoleService(data) {
  return RoleModel.create(data);
}

/**
 * Insert roles
 * @param {*} data
 * @returns
 */
export async function insertRolesService(data, options) {
  return RoleModel.insertMany(data, options);
}

/**
 * Get all roles
 * @param {*} query
 * @returns
 */
export async function getAllRolesService({ filters, offset = 0, limit = 10 }) {
  return RoleModel.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 });
}

/**
 * Count all roles
 * @param {*} filters
 * @returns
 */
export async function countAllRolesService(filters) {
  return RoleModel.countDocuments(filters);
}

/**
 * Get role by id
 * @param {*} id
 * @returns
 */
export async function getRoleByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter.id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return RoleModel.findOne(filter);
}

/**
 * Remove role by id
 * @param {*} id
 * @returns
 */
export async function removeRoleByIdService(id) {
  return RoleModel.findByIdAndSoftDelete(id);
}

/**
 * Check exist role name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistRoleNameService(name, skipId) {
  const result = await RoleModel.exists({
    $or: [{ name }, { slug: makeSlug(name) }],
    id: { $ne: skipId },
  });
  return !!result;
}

/**
 * Check exist role by id
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistRoleByIdService(id) {
  const result = await RoleModel.exists({
    id: id,
  });
  return !!result;
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateRoleInfoByIdService(id, data) {
  return RoleModel.findByIdAndUpdate(id, data, {
    new: true,
  });
}

/**
 * Update icon by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateRoleIconByIdService(id, file, currentIcon) {
  if (currentIcon) {
    removeImageByPublicIdService(currentIcon);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: 'role-icons',
  });

  return RoleModel.findByIdAndUpdate(
    id,
    {
      icon: result.public_id,
    },
    { new: true },
  );
}

/**
 * Update permissions by id
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function updateRolePermissionsByIdService(id, permissions = []) {
  const result = await Promise.all(
    permissions.map(async (item) => {
      return getPermissionByIdService(item);
    }),
  );

  return RoleModel.findByIdAndUpdate(
    id,
    {
      permissions: result.filter(Boolean),
    },
    { new: true },
  );
}

/**
 * Activate role
 * @param {*} id
 * @returns
 */
export async function activateRoleByIdService(id) {
  return RoleModel.findByIdAndUpdate(
    id,
    {
      isActive: true,
    },
    { new: true },
  );
}

/**
 * Deactivate role
 * @param {*} id
 * @returns
 */
export async function deactivateRoleByIdService(id) {
  return RoleModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    { new: true },
  );
}
