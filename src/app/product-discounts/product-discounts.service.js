import { isValidObjectId } from "mongoose";
import { ProductDiscountModel } from "#src/app/product-discounts/schemas/product-discount.schema";

const SELECTED_FIELDS =
  "_id name amount is_fixed end_date product_variant createdAt updatedAt";

/**
 * Create product discount
 * @param {*} data
 * @returns
 */
export async function createProductDiscountService(data) {
  return await ProductDiscountModel.create(data);
}

/**
 * Find one product discount by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductDiscountByIdService(
  id,
  selectFields = SELECTED_FIELDS,
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }

  return await ProductDiscountModel.findOne(filter).select(selectFields);
}

/**
 * Get all product discounts
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductDiscountsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductDiscountModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all product discounts
 * @param {*} filters
 * @returns
 */
export async function countAllProductDiscountsService(filters) {
  return ProductDiscountModel.countDocuments(filters);
}

/**
 * Update product discount by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductDiscountByIdService(id, data) {
  return ProductDiscountModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product discount by id
 * @param {*} id
 * @returns
 */
export async function removeProductDiscountByIdService(id) {
  return ProductDiscountModel.findByIdAndUpdate(id, {
    removedAt: new Date()
  }, {
    new: true,
  }).select(SELECTED_FIELDS);
}