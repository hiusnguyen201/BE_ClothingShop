import { isValidObjectId } from "mongoose";
import { ProductOptionImageModel } from "#src/modules/product_option_images/schemas/product-option-image.schema";

const SELECTED_FIELDS =
  "_id image product_option createdAt updatedAt";

/**
 * Create product option image
 * @param {*} data
 * @returns
 */
export async function createProductOptionImageService(data) {
  return ProductOptionImageModel.create(data);
}

/**
 * Find one product option image by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductOptionImageByIdService(
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

  return await ProductOptionImageModel.findOne(filter).select(selectFields);
}

/**
 * Get all product option images
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductOptionImagesService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductOptionImageModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all product option images
 * @param {*} filters
 * @returns
 */
export async function countAllProductOptionImagesService(filters) {
  return ProductOptionImageModel.countDocuments(filters);
}

/**
 * Update product option image by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductOptionImageByIdService(id, data) {
  return ProductOptionImageModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product option iamge by id
 * @param {*} id
 * @returns
 */
export async function removeProductOptionImageByIdService(id) {
  return await ProductOptionImageModel.findByIdAndDelete(id)
    .select(SELECTED_FIELDS)
}