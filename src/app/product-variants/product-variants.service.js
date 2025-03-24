import { isValidObjectId } from "mongoose";
import { ProductVariantModel } from "#src/app/product-variants/schemas/product-variants.schema";

const SELECTED_FIELDS =
  "_id quantity price sku image sold variant_values product product_discount createdAt updatedAt";

/**
 * Create product variant
 * @param {*} data
 * @returns
 */
export async function createProductVariantService(data) {
  return await ProductVariantModel.create(data);
}

/**
 * Get all products variants
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductVariantsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductVariantModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

// /**
//  * Count all products variants
//  * @param {*} filters
//  * @returns
//  */
// export async function countAllProductVariantsService(filters) {
//   return ProductVariantModel.countDocuments(filters);
// }

/**
 * Find one product variant by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductVariantByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.product;
  }

  return await ProductVariantModel.findOne(filter).select(selectFields);
}

/**
 * Update product variant by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductVariantByIdService(id, data) {
  return await ProductVariantModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product variant by id
 * @param {*} id
 * @returns
 */
export async function removeProductVariantByIdService(id) {
  return await ProductVariantModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Update product variant value by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductVariantValueByIdService(id, data) {
  return await ProductVariantModel.findByIdAndUpdate(id, {
    $push: { variant_values: data }
  }, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Update product discount by product variant id
 * @param {*} id
 * @param {*} productDiscountId
 * @returns
 */
export async function updateProductDiscountByProductVariantIdService(id, productDiscountId) {
  return await ProductVariantModel.findByIdAndUpdate(
    id,
    {
      product_discount: productDiscountId
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}