import { CacheKey } from '#src/utils/cache-key';
import { OPTION_CACHE_KEY_PREFIX } from '#src/app/options/options.constant';
import redisClient from '#src/modules/redis/redis.service';

export async function getOptionFromCache(optionId) {
  if (!optionId) return null;
  const key = CacheKey.new(OPTION_CACHE_KEY_PREFIX.DETAILS, optionId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getListOptionFromCache(filters) {
  const key = CacheKey.newPaginationKey(OPTION_CACHE_KEY_PREFIX.LIST_OPTION, filters);
  const cached = await redisClient.get(key);
  return cached ? cached : [];
}

export async function setOptionToCache(optionId, optionData) {
  const key = CacheKey.new(OPTION_CACHE_KEY_PREFIX.DETAILS, optionId);
  await redisClient.set(key, optionData);
}

export async function setListOptionToCache(filters, listData) {
  const key = CacheKey.newPaginationKey(OPTION_CACHE_KEY_PREFIX.LIST_OPTION, filters);
  await redisClient.set(key, listData);
}

export async function deleteOptionFromCache(optionId) {
  const keyOption = CacheKey.new(OPTION_CACHE_KEY_PREFIX.DETAILS, optionId);
  const keyList = CacheKey.new(OPTION_CACHE_KEY_PREFIX.LIST_OPTION, '*');
  await redisClient.del([keyOption, keyList]);
}
