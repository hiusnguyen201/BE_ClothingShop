import { isValidObjectId } from "mongoose";
import { ProductOptionModel } from "#src/modules/product-options/schemas/product-option.schema";

const SELECTED_FIELDS =
  "_id option_name hasImages createdAt updatedAt";

/**
 * Create product option
 * @param {*} data
 * @returns
 */
export async function createProductOptionService(data) {
  return ProductOptionModel.create(data);
}

/**
 * Find one product option by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductOptionByIdService(
  id,
  selectFields = SELECTED_FIELDS,
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return await ProductOptionModel.findOne(filter).select(selectFields);
}

/**
 * Get all product options
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductOptionsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductOptionModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all product options
 * @param {*} filters
 * @returns
 */
export async function countAllProductOptionsService(filters) {
  return ProductOptionModel.countDocuments(filters);
}

/**
 * Update product option by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductOptionByIdService(id, data) {
  return ProductOptionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product option by id
 * @param {*} id
 * @returns
 */
export async function removeProductOptionByIdService(id) {
  return await ProductOptionModel.findByIdAndDelete(id)
    .select(SELECTED_FIELDS)
}