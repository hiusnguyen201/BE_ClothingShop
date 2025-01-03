import { isValidObjectId } from "mongoose";
import { CategoryModel } from "#src/modules/categories/schemas/category.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { REGEX_PATTERNS } from "#src/core/constant";
import { makeSlug } from "#src/utils/string.util";

const SELECTED_FIELDS =
  "_id image name slug parent isHide level createdAt updatedAt";

/**
 * Create category
 * @param {*} data
 * @returns
 */
export async function createCategoryService(data) {
  return CategoryModel.create(data);
}

/**
 * Get all categories
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllCategoriesService({
  filters,
  offset,
  limit,
  selectFields = SELECTED_FIELDS,
}) {
  return CategoryModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all categories
 * @param {*} filters
 * @returns
 */
export async function countAllCategoriesService(filters) {
  return CategoryModel.countDocuments(filters);
}

/**
 * Get one category by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getCategoryByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return CategoryModel.findOne(filter).select(selectFields);
}

/**
 * Update info category by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateCategoryInfoByIdService(id, data) {
  return CategoryModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Update image category by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateCategoryImageByIdService(
  id,
  file,
  currentImage
) {
  if (currentImage) {
    removeImageByPublicIdService(currentImage);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: "categories-image",
  });

  return CategoryModel.findByIdAndUpdate(
    id,
    {
      image: result.public_id,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Remove category by id
 * @param {*} id
 * @returns
 */
export async function removeCategoryByIdService(id) {
  return CategoryModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistCategoryNameService(name, skipId) {
  const existCategory = await CategoryModel.findOne({
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
  return Boolean(existCategory);
}

/**
 * Show category
 * @param {*} id
 * @returns
 */
export async function showCategoryService(id) {
  await CategoryModel.findByIdAndUpdate(
    id,
    {
      isHide: false,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
  return;
}

/**
 * Hide category
 * @param {*} id
 * @returns
 */
export async function hideCategoryService(id) {
  await CategoryModel.findByIdAndUpdate(
    id,
    {
      isHide: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
  return;
}
