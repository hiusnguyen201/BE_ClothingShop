import { CacheKey } from '#src/utils/cache-key';
import { CUSTOMER_CACHE_KEY_PREFIX } from '#src/app/customers/customers.constant';
import redisClient from '#src/modules/redis/redis.service';
import { USER_TYPE } from '#src/app/users/users.constant';

export async function getCustomerFromCache(customerId) {
  if (!customerId) return null;
  const key = CacheKey.new(CUSTOMER_CACHE_KEY_PREFIX.PROFILE, customerId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getCustomersFromCache(filters) {
  const key = CacheKey.newPaginationKey(CUSTOMER_CACHE_KEY_PREFIX.LIST_CUSTOMER, {
    ...filters,
    type: USER_TYPE.CUSTOMER,
  });
  const cached = await redisClient.get(key);
  return cached ?? [0, []];
}

export async function setCustomerToCache(customerId, userData) {
  const key = CacheKey.new(CUSTOMER_CACHE_KEY_PREFIX.PROFILE, customerId);
  await redisClient.set(key, userData);
}

export async function setCustomersToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(CUSTOMER_CACHE_KEY_PREFIX.LIST_CUSTOMER, {
    ...filters,
    type: USER_TYPE.CUSTOMER,
  });
  await redisClient.set(key, [totalCount, listData]);
}

export async function deleteCustomerFromCache(customerId) {
  const keyUser = CacheKey.new(CUSTOMER_CACHE_KEY_PREFIX.PROFILE, customerId);
  const keyList = CacheKey.new(CUSTOMER_CACHE_KEY_PREFIX.LIST_CUSTOMER, '*');
  await redisClient.del([keyUser, keyList]);
}
