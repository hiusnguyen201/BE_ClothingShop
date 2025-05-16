import { getTopProductVariantsRepository } from '#src/app/product-variants/product-variants.repository';

/**
 *Get top product variants
 * @param {GetTopProductVariantsDto} payload
 * @returns
 */
export async function getTopProductVariantsService(payload) {
  return await getTopProductVariantsRepository(payload.limit);
}
