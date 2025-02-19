import { isValidObjectId } from "mongoose";
import { ValueImageModel } from "#src/modules/value-images/schemas/product-option-image.schema";

const SELECTED_FIELDS =
  "_id image createdAt updatedAt";

/**
 * Create value image
 * @param {*} data
 * @returns
 */
export async function createValueImageService(data) {
  return ValueImageModel.create(data);
}

/**
 * Find one value image by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getValueImageByIdService(
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

  return await ValueImageModel.findOne(filter).select(selectFields);
}

/**
 * Get all value images
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllValueImagesService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ValueImageModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all value images
 * @param {*} filters
 * @returns
 */
export async function countAllValueImagesService(filters) {
  return ValueImageModel.countDocuments(filters);
}

/**
 * Update value image by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateValueImageByIdService(id, data) {
  return ValueImageModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove value iamge by id
 * @param {*} id
 * @returns
 */
export async function removeValueImageByIdService(id) {
  return await ValueImageModel.findByIdAndDelete(id)
    .select(SELECTED_FIELDS)
}