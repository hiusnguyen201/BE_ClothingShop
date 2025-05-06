import { CacheKey } from '#src/utils/cache-key';
import { CATEGORY_CACHE_KEY_PREFIX } from '#src/app/categories/categories.constant';
import redisClient from '#src/modules/redis/redis.service';
import { USER_TYPE } from '#src/app/users/users.constant';

export async function getCategoryFromCache(categoryId) {
  if (!categoryId) return null;
  const key = CacheKey.new(CATEGORY_CACHE_KEY_PREFIX.PROFILE, categoryId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getTotalCountAndListCategoryFromCache(filters) {
  const key = CacheKey.newPaginationKey(CATEGORY_CACHE_KEY_PREFIX.LIST_CATEGORY, filters);
  const cached = await redisClient.get(key);
  return cached ?? [0, []];
}

export async function setCategoryToCache(categoryId, userData) {
  const key = CacheKey.new(CATEGORY_CACHE_KEY_PREFIX.PROFILE, categoryId);
  await redisClient.set(key, userData);
}

export async function setTotalCountAndListCategoryToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(CATEGORY_CACHE_KEY_PREFIX.LIST_CATEGORY, {
    ...filters,
    type: USER_TYPE.CATEGORY,
  });
  await redisClient.set(key, [totalCount, listData]);
}

export async function deleteCategoryFromCache(categoryId) {
  const keyUser = CacheKey.new(CATEGORY_CACHE_KEY_PREFIX.PROFILE, categoryId);
  const keyList = CacheKey.new(CATEGORY_CACHE_KEY_PREFIX.LIST_CATEGORY, '*');
  await redisClient.del([keyUser, keyList]);
}
