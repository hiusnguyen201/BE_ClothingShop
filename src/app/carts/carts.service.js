import redisClient from '#src/modules/redis/redis';

/**
 * Add to cart
 * @param {*} customerId
 * @param {*} product
 * @returns
 */
export async function addToCartService(customerId, product) {
    const cartKey = `cart:${customerId}`;
    const productData = {
        name: product.name,
        quantity: product.quantity,
        price: product.price,
    };

    return await redisClient.hSet(cartKey, String(product.productVariantId), JSON.stringify(productData));
}

/**
 * Get cart
 * @param {*} customerId
 * @returns
 */
export async function getCartService(customerId) {
    const cartKey = `cart:${customerId}`;
    const cartData = await redisClient.hGetAll(cartKey);

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
    await redisClient.hDel(cartKey, productVariantId);
}

/**
 * Clear cart
 * @param {*} customerId
 * @returns
 */
export async function clearCartService(customerId) {
    const cartKey = `cart:${customerId}`;
    await redisClient.del(cartKey);
};