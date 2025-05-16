import { isValidObjectId } from 'mongoose';
import { CategoryModel } from '#src/app/categories/models/category.model';
import { REGEX_PATTERNS } from '#src/core/constant';
import { makeSlug } from '#src/utils/string.util';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { CATEGORY_SELECTED_FIELDS } from '#src/app/categories/categories.constant';

export function newCategoryRepository(data) {
  return new CategoryModel({ ...data, slug: makeSlug(data.name) });
}

export async function saveCategoryRepository(categoryDoc) {
  return categoryDoc.save();
}

export async function insertCategoriesRepository(data = [], session) {
  return await CategoryModel.bulkSave(data, { session, ordered: true });
}

export async function getAndCountCategoriesRepository(parentId = null, filters, skip, limit, sortBy, sortOrder) {
  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  // Get List
  const list = await CategoryModel.aggregate([
    ...(parentId !== undefined ? [{ $match: { parent: parentId } }] : []),
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
    ...(parentId !== undefined ? [{ $match: { parent: parentId } }] : []),
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

export async function countSubcategoriesRepository(parentId) {
  return CategoryModel.countDocuments({ parent: parentId });
}

export async function getCategoryByIdRepository(id) {
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

export async function updateCategoryInfoByIdRepository(id, data) {
  if (data.name) {
    data.slug = makeSlug(data.name);
  }

  return CategoryModel.findByIdAndUpdate(id, data, {
    new: true,
  })
    .select(CATEGORY_SELECTED_FIELDS)
    .lean();
}

export async function removeCategoryByIdRepository(id) {
  return CategoryModel.findByIdAndSoftDelete(id).select('_id').lean();
}

export async function checkExistCategoryNameRepository(name, skipId) {
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
