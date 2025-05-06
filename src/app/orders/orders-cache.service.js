import { CacheKey } from '#src/utils/cache-key';
import { ORDER_CACHE_KEY_PREFIX } from '#src/app/orders/orders.constant';
import redisClient from '#src/modules/redis/redis.service';

export async function getOrderFromCache(orderId) {
  if (!orderId) return null;
  const key = CacheKey.new(ORDER_CACHE_KEY_PREFIX.DETAILS, orderId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getTotalCountAndListOrderFromCache(filters) {
  const key = CacheKey.newPaginationKey(ORDER_CACHE_KEY_PREFIX.LIST_ORDER, filters);
  const cached = await redisClient.get(key);
  return cached ?? [0, []];
}

export async function setOrderToCache(orderId, orderData) {
  const key = CacheKey.new(ORDER_CACHE_KEY_PREFIX.DETAILS, orderId);
  await redisClient.set(key, orderData);
}

export async function setTotalCountAndListOrderToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(ORDER_CACHE_KEY_PREFIX.LIST_ORDER, filters);
  await redisClient.set(key, [totalCount, listData]);
}

export async function deleteOrderFromCache(orderId) {
  const keyOrder = CacheKey.new(ORDER_CACHE_KEY_PREFIX.DETAILS, orderId);
  const keyList = CacheKey.new(ORDER_CACHE_KEY_PREFIX.LIST_ORDER, '*');
  await redisClient.del([keyOrder, keyList]);
}
