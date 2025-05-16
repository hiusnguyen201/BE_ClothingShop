import { CacheKey } from '#src/utils/cache-key';
import { ROLE_CACHE_KEY_PREFIX } from '#src/app/roles/roles.constant';
import redisClient from '#src/modules/redis/redis.service';

export async function getRoleFromCache(roleId) {
  if (!roleId) return null;
  const key = CacheKey.new(ROLE_CACHE_KEY_PREFIX.DETAILS, roleId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getRolesFromCache(filters) {
  const key = CacheKey.newPaginationKey(ROLE_CACHE_KEY_PREFIX.LIST_ROLE, filters);
  const cached = await redisClient.get(key);
  return cached ?? [0, []];
}

export async function setRoleToCache(roleId, roleData) {
  const key = CacheKey.new(ROLE_CACHE_KEY_PREFIX.DETAILS, roleId);
  await redisClient.set(key, roleData);
}

export async function setRolesToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(ROLE_CACHE_KEY_PREFIX.LIST_ROLE, filters);
  await redisClient.set(key, [totalCount, listData]);
}

export async function deleteRoleFromCache(roleId) {
  const keyRole = CacheKey.new(ROLE_CACHE_KEY_PREFIX.DETAILS, roleId);
  const keyList = CacheKey.new(ROLE_CACHE_KEY_PREFIX.LIST_ROLE, '*');
  await redisClient.del([keyRole, keyList]);
}
