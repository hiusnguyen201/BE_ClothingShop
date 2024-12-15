import { isValidObjectId } from "mongoose";
import { CategoryModel } from "#src/modules/categories/schemas/category.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { calculatePagination } from "#src/utils/pagination.util";
import { REGEX_PATTERNS } from "#src/core/constant";

const SELECTED_FIELDS =
  "_id icon name slug status parentCategory isHidden createdAt updatedAt";

/**
 * Create category
 * @param {*} data
 * @returns
 */
export async function createCategoryService(data) {
  return await CategoryModel.create(data);
}

/**
 * Get all categories
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllCategoriesService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", status, limit = 10, page = 1 } = query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: "i" } }],
    [status && "status"]: status,
  };

  const totalCount = await CategoryModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const categories = await CategoryModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    meta: metaData,
    list: categories,
  };
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
  } else if (REGEX_PATTERNS.SLUG.test(id)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return await CategoryModel.findOne(filter).select(selectFields);
}

/**
 * Update info category by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateCategoryInfoByIdService(id, data) {
  return await CategoryModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Update icon category by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateCategoryIconByIdService(id, file, currentIcon) {
  if (currentIcon) {
    removeImageByPublicIdService(currentIcon);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: "categories-icon",
  });

  return await CategoryModel.findByIdAndUpdate(
    id,
    {
      icon: result.public_id,
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
  return await CategoryModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistCategoryNameService(name, skipId) {
  const existCategory = await CategoryModel.findOne({
    name,
    _id: { $ne: skipId },
  }).select("_id");
  return Boolean(existCategory);
}
