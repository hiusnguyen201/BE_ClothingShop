import { CacheKey } from '#src/utils/cache-key';
import { PRODUCT_CACHE_KEY_PREFIX } from '#src/app/products/products.constant';
import redisClient from '#src/modules/redis/redis.service';

export async function getProductFromCache(productId) {
  if (!productId) return null;
  const key = CacheKey.new(PRODUCT_CACHE_KEY_PREFIX.DETAILS, productId);
  const cached = await redisClient.get(key);
  return cached ? cached : null;
}

export async function getTotalCountAndListProductFromCache(filters) {
  const key = CacheKey.newPaginationKey(PRODUCT_CACHE_KEY_PREFIX.LIST_PRODUCT, filters);
  const cached = await redisClient.get(key);
  return cached ? cached : [0, []];
}

export async function setProductToCache(productId, productData) {
  const key = CacheKey.new(PRODUCT_CACHE_KEY_PREFIX.DETAILS, productId);
  await redisClient.set(key, productData);
}

export async function setTotalCountAndListProductToCache(filters, totalCount, listData) {
  const key = CacheKey.newPaginationKey(PRODUCT_CACHE_KEY_PREFIX.LIST_PRODUCT, filters);
  await redisClient.set(key, [totalCount, listData]);
}

export async function deleteProductFromCache(productId) {
  const keyProduct = CacheKey.new(PRODUCT_CACHE_KEY_PREFIX.DETAILS, productId);
  const keyList = CacheKey.new(PRODUCT_CACHE_KEY_PREFIX.LIST_PRODUCT, '*');
  await redisClient.del([keyProduct, keyList]);
}
