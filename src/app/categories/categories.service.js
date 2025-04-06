import { isValidObjectId } from 'mongoose';
import { CategoryModel } from '#src/app/categories/models/category.model';
import { REGEX_PATTERNS } from '#src/core/constant';
import { makeSlug } from '#src/utils/string.util';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { CATEGORY_SELECTED_FIELDS, MAXIMUM_CHILDREN_CATEGORY_LEVEL } from '#src/app/categories/categories.constant';

/**
 * New category instance
 * @param {object} data
 * @returns
 */
export async function newCategoryService(data) {
  return new CategoryModel({ ...data, slug: makeSlug(data.name) });
}

/**
 * Save category
 * @param {CategoryModel} categoryDoc
 * @returns
 */
export async function saveCategoryService(categoryDoc) {
  return categoryDoc.save();
}

/**
 * Get and count categories
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountCategoriesService(filters, skip, limit, sortBy, sortOrder) {
  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  // Get List
  const list = await CategoryModel.aggregate([
    { $match: { parent: null } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parent',
        as: 'children',
        pipeline: [{ $match: filters }],
      },
    },
    { $match: { $or: [filters, { 'children.0': { $exists: true } }] } },
    { $project: { ...CATEGORY_SELECTED_FIELDS, children: CATEGORY_SELECTED_FIELDS } },
  ])
    .skip(queryOptions.skip)
    .limit(queryOptions.limit)
    .sort(queryOptions.sort);

  // Count
  const category = await CategoryModel.aggregate([
    { $match: { parent: null } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parent',
        as: 'children',
        pipeline: [{ $match: filters }],
      },
    },
    { $match: { $or: [filters, { 'children.0': { $exists: true } }] } },
    { $count: 'totalCount' },
  ]);

  return [category.length > 0 ? category[0]?.totalCount : 0, list];
}

/**
 * Get one category by id
 * @param {string} id
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

  return CategoryModel.findOne(filter).select(CATEGORY_SELECTED_FIELDS).lean();
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
  })
    .select(CATEGORY_SELECTED_FIELDS)
    .lean();
}

/**
 * Remove category by id
 * @param {*} id
 * @returns
 */
export async function removeCategoryByIdService(id) {
  return CategoryModel.findByIdAndSoftDelete(id).select('_id').lean();
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
    const key = isValidObjectId(skipId) ? '_id' : skipId.match(REGEX_PATTERNS.SLUG) ? 'slug' : null;
    if (key) filters[key] = { $ne: skipId };
  }

  const result = await CategoryModel.findOne(filters, '_id', { withRemoved: true }).lean();
  return !!result;
}
