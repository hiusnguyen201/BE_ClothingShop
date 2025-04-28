import redisClient from '#src/modules/redis/redis.service';

/**
 * Add to cart
 * @param {*} customerId
 * @param {*} product
 * @returns
 */
export async function addToCartService(customerId, product) {
  const cartKey = `cart:${customerId}`;
  const productData = {
    productId: product.productId,
    productVariantId: product.productVariantId,
    quantity: product.quantity,
  };

  return await redisClient.hset(cartKey, String(product.productVariantId), JSON.stringify(productData));
}

/**
 * Get cart
 * @param {*} customerId
 * @returns
 */
export async function getCartService(customerId) {
  const cartKey = `cart:${customerId}`;
  const cartData = await redisClient.hgetall(cartKey);

  return Object.entries(cartData).map(([productVariantId, data]) => ({
    productVariantId,
    ...JSON.parse(data),
  }));
}

/**
 * Remove cart
 * @param {*} customerId
 * @param {*} productVariantId
 * @returns
 */
export async function removeFromCartService(userId, productVariantId) {
  const cartKey = `cart:${userId}`;
  await redisClient.hdel(cartKey, productVariantId);
}

/**
 * Clear cart
 * @param {*} customerId
 * @returns
 */
export async function clearCartService(customerId) {
  const cartKey = `cart:${customerId}`;
  await redisClient.del(cartKey);
}
