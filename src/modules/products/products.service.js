import { isValidObjectId } from "mongoose";
import { ProductModel } from "#src/modules/products/schemas/product.schema";
import { makeSlug } from "#src/utils/string.util";

const SELECTED_FIELDS =
  "_id name slug short_description content status is_hidden is_featured is_new avg_rating total_review category sub_category createdAt updatedAt";

/**
 * Create product
 * @param {*} data
 * @returns
 */
export async function createProductService(data) {
  return await ProductModel.create(data);
}

/**
 * Get all products
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all products
 * @param {*} filters
 * @returns
 */
export async function countAllProductsService(filters) {
  return ProductModel.countDocuments(filters);
}

/**
 * Find one product by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return await ProductModel.findOne(filter).select(selectFields);
}

/**
 * Update product by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductByIdService(id, data) {
  return await ProductModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product by id
 * @param {*} id
 * @returns
 */
export async function removeProductByIdService(id) {
  return await ProductModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist product
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistProductNameService(name, skipId) {
  const product = await ProductModel.findOne({
    $or: [
      {
        name,
      },
      {
        slug: makeSlug(name),
      },
    ],
    _id: { $ne: skipId },
  }).select("_id");
  return Boolean(product);
}

/**
 * Show product
 * @param {*} id
 * @returns
 */
export async function showProductService(id) {
  return ProductModel.findByIdAndUpdate(
    id,
    {
      is_hidden: false,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Hide product
 * @param {*} id
 * @returns
 */
export async function hideProductService(id) {
  return ProductModel.findByIdAndUpdate(
    id,
    {
      is_hidden: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}