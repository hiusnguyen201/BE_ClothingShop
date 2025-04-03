import { isValidObjectId } from "mongoose";
import { ProductReviewModel } from "#src/app/product-reviews/models/product-review.model";

const SELECTED_FIELDS =
  "_id comment score product customer createdAt updatedAt";

/**
 * Create product review
 * @param {*} data
 * @returns
 */
export async function createProductReviewService(data) {
  return await ProductReviewModel.create(data);
}

/**
 * Get all product reviews
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductReviewsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductReviewModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all product reviews
 * @param {*} filters
 * @returns
 */
export async function countAllProductReviewsService(filters) {
  return ProductReviewModel.countDocuments(filters);
}

/**
 * Find one product review by id
 * @param {*} id
 * @param {*} customerId
 * @param {*} selectFields
 * @returns
 */
export async function getProductReviewByIdService(
  id,
  customerId,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }
  if (isValidObjectId(customerId)) {
    filter.customer = customerId;
  } else {
    return null;
  }

  return await ProductReviewModel.findOne(filter).select(selectFields);
}

/**
 * Update product review by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductReviewByIdService(id, data) {
  return await ProductReviewModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product review by id
 * @param {*} id
 * @returns
 */
export async function removeProductReviewByIdService(id) {
  return await ProductReviewModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}