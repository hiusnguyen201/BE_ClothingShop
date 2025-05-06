import { CacheKey } from '#src/utils/cache-key';
import { SHIPPING_ADDRESS_CACHE_KEY_PREFIX } from '#src/app/shipping-address/shipping-address.constant';
import redisClient from '#src/modules/redis/redis.service';

export async function getShippingAddressFromCache(shippingAddressId) {
  if (!shippingAddressId) return null;
  const key = CacheKey.new(SHIPPING_ADDRESS_CACHE_KEY_PREFIX.DETAILS, shippingAddressId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getTotalCountAndListShippingAddressFromCache(filters) {
  const key = CacheKey.newPaginationKey(SHIPPING_ADDRESS_CACHE_KEY_PREFIX.LIST_SHIPPING_ADDRESS, filters);
  const cached = await redisClient.get(key);
  return cached ?? [0, []];
}

export async function setShippingAddressToCache(shippingAddressId, shippingAddressData) {
  const key = CacheKey.new(SHIPPING_ADDRESS_CACHE_KEY_PREFIX.DETAILS, shippingAddressId);
  await redisClient.set(key, shippingAddressData);
}

export async function setTotalCountAndListShippingAddressToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(SHIPPING_ADDRESS_CACHE_KEY_PREFIX.LIST_SHIPPING_ADDRESS, filters);
  await redisClient.set(key, [totalCount, listData]);
}

export async function deleteShippingAddressFromCache(shippingAddressId) {
  const keyShippingAddress = CacheKey.new(SHIPPING_ADDRESS_CACHE_KEY_PREFIX.DETAILS, shippingAddressId);
  const keyList = CacheKey.new(SHIPPING_ADDRESS_CACHE_KEY_PREFIX.LIST_SHIPPING_ADDRESS, '*');
  await redisClient.del([keyShippingAddress, keyList]);
}
