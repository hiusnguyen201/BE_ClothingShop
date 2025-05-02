import { CacheKey } from '#src/utils/cache-key';
import { PERMISSION_CACHE_KEY_PREFIX } from '#src/app/permissions/permissions.constant';
import redisClient from '#src/modules/redis/redis.service';

export async function getPermissionFromCache(permissionId) {
  if (!permissionId) return null;
  const key = CacheKey.new(PERMISSION_CACHE_KEY_PREFIX.PROFILE, permissionId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getTotalCountAndListPermissionFromCache(filters) {
  const key = CacheKey.newPaginationKey(PERMISSION_CACHE_KEY_PREFIX.LIST_PERMISSION, filters);
  const cached = await redisClient.get(key);
  return cached ? cached : [0, []];
}

export async function setPermissionToCache(permissionId, permissionData) {
  const key = CacheKey.new(PERMISSION_CACHE_KEY_PREFIX.PROFILE, permissionId);
  await redisClient.set(key, permissionData);
}

export async function setTotalCountAndListPermissionToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(PERMISSION_CACHE_KEY_PREFIX.LIST_PERMISSION, filters);
  await redisClient.set(key, [totalCount, listData]);
}

export async function deletePermissionFromCache(permissionId) {
  const keyPermission = CacheKey.new(PERMISSION_CACHE_KEY_PREFIX.PROFILE, permissionId);
  const keyList = CacheKey.new(PERMISSION_CACHE_KEY_PREFIX.LIST_PERMISSION, '*');
  await redisClient.del([keyPermission, keyList]);
}
