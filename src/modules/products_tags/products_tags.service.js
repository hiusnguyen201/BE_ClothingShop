import { isValidObjectId } from "mongoose";
import { TagModel } from "#src/modules/tags/schemas/tag.schema";
import { ProductModel } from "#src/modules/products/schemas/product.schema";
import { ProductTagModel } from "#src/modules/products_tags/schemas/products-tags.schema";

const SELECTED_FIELDS =
  "_id product tag createdAt updatedAt";

/**
 * Create product tags
 * @param {*} tagDocs
 * @returns
 */
export async function createProductTagsService(tagDocs) {
  return ProductTagModel.insertMany(tagDocs);
}

/**
 * Find one tag by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getTagByIdService(
  id,
  selectFields = "_id"
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return await TagModel.findOne(filter).select(selectFields);
}

/**
 * Find one product by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductByIdService(
  id,
  selectFields = "_id"
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
 * Find one product tag by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductTagByIdService(
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

  return await ProductTagModel.findOne(filter).select(selectFields);
}

/**
 * Get all products tags
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductsTagsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductTagModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all products tags
 * @param {*} filters
 * @returns
 */
export async function countAllProductsTagsService(filters) {
  return ProductTagModel.countDocuments(filters);
}

/**
 * Remove products tags by product id
 * @param {*} id
 * @returns
 */
export async function removeProductTagByIdService(productId, tags) {
  return await ProductTagModel.deleteMany({
    product: productId,
    tag: { $in: tags }
  }).select(SELECTED_FIELDS)
}

/**
 * Find exist product tag
 * @param {*} id
 * @returns
 */
export async function getExistProductTagService(productId, tagIds) {
  return await ProductTagModel.find({
    product: productId,
    tag: { $in: tagIds }
  });
}