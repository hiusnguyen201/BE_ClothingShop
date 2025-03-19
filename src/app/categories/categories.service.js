import { isValidObjectId } from 'mongoose';
import { CategoryModel } from '#src/app/categories/models/category.model';
import { REGEX_PATTERNS } from '#src/core/constant';
import { makeSlug } from '#src/utils/string.util';
import { CATEGORY_STATUS } from '#src/app/categories/categories.constant';

/**
 * Create category instance
 * @param {*} data
 * @returns
 */
export async function createCategoryService(data) {
  return CategoryModel.create({ ...data, slug: makeSlug(data.name) });
}

/**
 * Get all categories
 * @param {*} query
 * @returns
 */
export async function getAllCategoriesService({ filters, offset, limit, sortBy, sortOrder }) {
  return CategoryModel.find(filters)
    .skip(offset)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .lean();
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
 * @returns
 */
export async function getCategoryByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return CategoryModel.findOne(filter).lean();
}

/**
 * Update info category by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateCategoryInfoByIdService(id, data) {
  if (data.name) {
    data.slug = makeSlug(data.name);
  }

  return CategoryModel.findByIdAndUpdate(id, data, {
    new: true,
  }).lean();
}

/**
 * Remove category by id
 * @param {*} id
 * @returns
 */
export async function removeCategoryByIdService(id) {
  return CategoryModel.findByIdAndSoftDelete(id).lean();
}

/**
 * Check is exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistCategoryNameService(name, skipId) {
  const filters = {
    $or: [
      {
        name,
      },
      {
        slug: makeSlug(name),
      },
    ],
  };

  if (skipId) {
    filters._id = { $ne: skipId };
  }

  const result = await CategoryModel.findOne(filters, '_id', { withRemoved: true }).lean();
  return !!result;
}

/**
 * Activate category
 * @param {*} id
 * @returns
 */
export async function activateCategoryService(id) {
  return CategoryModel.findByIdAndUpdate(
    id,
    {
      status: CATEGORY_STATUS.ACTIVE,
    },
    { new: true },
  ).lean();
}

/**
 * Deactivate category
 * @param {*} id
 * @returns
 */
export async function deactivateCategoryService(id) {
  return CategoryModel.findByIdAndUpdate(
    id,
    {
      status: CATEGORY_STATUS.INACTIVE,
    },
    { new: true },
  ).lean();
}
