import { getAndCountPermissionsRepository } from '#src/app/permissions/permissions.repository';
import { PERMISSION_SEARCH_FIELDS } from '#src/app/permissions/permissions.constant';
import { getPermissionsFromCache, setPermissionsToCache } from '#src/app/permissions/permissions.cache';

/**
 * @typedef {import("#src/app/permissions/models/permission.model").PermissionModel} PermissionModel
 * @typedef {import("#src/app/permissions/dtos/get-list-permission.dto").GetListPermissionDto} GetListPermissionPort
 */

/**
 * Get permissions
 * @param {GetListPermissionPort} payload
 * @returns {Promise<[number, PermissionModel[]]>}
 */
export const getAllPermissionsService = async (payload) => {
  const filters = {
    $or: PERMISSION_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
  };

  const cached = await getPermissionsFromCache(payload);

  if (cached && Array.isArray(cached) && cached.length === 2 && cached[0] > 0) {
    return cached;
  }

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, permissions] = await getAndCountPermissionsRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  await setPermissionsToCache(payload, totalCount, permissions);

  return [totalCount, permissions];
};
