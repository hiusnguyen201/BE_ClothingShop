import { CacheKey } from '#src/utils/cache-key';
import { USER_CACHE_KEY_PREFIX, USER_TYPE } from '#src/app/users/users.constant';
import redisClient from '#src/modules/redis/redis.service';

export async function getUserFromCache(userId) {
  if (!userId) return null;
  const key = CacheKey.new(USER_CACHE_KEY_PREFIX.PROFILE, userId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getTotalCountAndListUserFromCache(filters) {
  const key = CacheKey.newPaginationKey(USER_CACHE_KEY_PREFIX.LIST_USER, filters);
  const cached = await redisClient.get(key);
  return cached ? cached : [0, []];
}

export async function setUserToCache(userId, userData) {
  const key = CacheKey.new(USER_CACHE_KEY_PREFIX.PROFILE, userId);
  await redisClient.set(key, userData);
}

export async function setTotalCountAndListUserToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(USER_CACHE_KEY_PREFIX.LIST_USER, { ...filters, type: USER_TYPE.USER });
  await redisClient.set(key, [totalCount, listData]);
}

export async function deleteUserFromCache(userId) {
  const keyUser = CacheKey.new(USER_CACHE_KEY_PREFIX.PROFILE, userId);
  const keyList = CacheKey.new(USER_CACHE_KEY_PREFIX.LIST_USER, '*');
  await redisClient.del([keyUser, keyList]);
}
