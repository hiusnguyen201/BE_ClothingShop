import { HttpException } from '#src/core/exception/http-exception';
import {
  getCategoryByIdRepository,
  updateCategoryInfoByIdRepository,
  removeCategoryByIdRepository,
  checkExistCategoryNameRepository,
  getAndCountCategoriesRepository,
  newCategoryRepository,
  saveCategoryRepository,
  countSubcategoriesRepository,
} from '#src/app/categories/categories.repository';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { Code } from '#src/core/code/Code';
import { CATEGORY_SEARCH_FIELDS, MAXIMUM_CHILDREN_CATEGORY_LEVEL } from '#src/app/categories/categories.constant';
import {
  deleteCategoryFromCache,
  getCategoryFromCache,
  getCategoriesFromCache,
  setCategoryToCache,
  setCategoriesToCache,
} from '#src/app/categories/categories.cache';
import { Assert } from '#src/core/assert/Assert';

export const checkExistCategoryNameService = async (payload) => {
  return await checkExistCategoryNameRepository(payload.name);
};

export const createCategoryService = async (payload) => {
  const isExistName = await checkExistCategoryNameRepository(payload.name);
  Assert.isFalse(
    isExistName,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exists' }),
  );

  const category = newCategoryRepository({ ...payload, level: 1 });
  if (payload.parentId) {
    const existParent = await getCategoryByIdRepository(payload.parentId);
    Assert.isTrue(
      existParent,
      HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Parent category not found' }),
    );
    category.parent = existParent._id;

    const nextCategoryLevel = existParent.level + 1;
    Assert.isFalse(
      nextCategoryLevel > MAXIMUM_CHILDREN_CATEGORY_LEVEL,
      HttpException.new({
        code: Code.BAD_REQUEST,
        overrideMessage: `Parent category has a maximum ${MAXIMUM_CHILDREN_CATEGORY_LEVEL} levels only`,
      }),
    );
    category.level = nextCategoryLevel;
  }

  if (payload.image) {
    const result = await uploadImageBufferService({ buffer: payload.image, folderName: 'categories-image' });
    category.image = result.url;
  }

  await saveCategoryRepository(category);

  // Clear cache
  await deleteCategoryFromCache(category._id);

  return category;
};

export const getAllCategoriesService = async (payload) => {
  const filters = {
    $or: CATEGORY_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
  };

  const cached = await getCategoriesFromCache({ ...payload, ...filters });
  if (cached && Array.isArray(cached) && cached.length === 2 && cached[0] > 0) return cached;

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, categories] = await getAndCountCategoriesRepository(
    null,
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  await setCategoriesToCache(payload, totalCount, categories);

  return [totalCount, categories];
};

export const getCategoryByIdService = async (payload) => {
  const cached = await getCategoryFromCache(payload.categoryId);
  if (cached) return cached;

  const category = await getCategoryByIdRepository(payload.categoryId);
  Assert.isTrue(category, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' }));

  await setCategoryToCache(payload.categoryId, category);

  return category;
};

export const updateCategoryByIdService = async (payload) => {
  const existCategory = await getCategoryByIdRepository(payload.categoryId);
  Assert.isTrue(
    existCategory,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' }),
  );

  const isExistName = await checkExistCategoryNameRepository(payload.name, existCategory._id);
  Assert.isFalse(
    isExistName,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exist' }),
  );

  if (payload.image instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: payload.image, folderName: 'categories-image' });
    payload.image = result.url;
  }

  const updatedCategory = await updateCategoryInfoByIdRepository(existCategory._id, payload);

  // Clear cache
  await deleteCategoryFromCache(existCategory._id);

  return updatedCategory;
};

export const removeCategoryByIdService = async (payload) => {
  const existCategory = await getCategoryByIdRepository(payload.categoryId);
  Assert.isTrue(
    existCategory,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' }),
  );

  const subcategoryCount = await countSubcategoriesRepository(existCategory._id);
  Assert.isFalse(
    subcategoryCount > 0,
    HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Category includes subcategories' }),
  );

  await removeCategoryByIdRepository(existCategory._id);

  // Clear cache
  await deleteCategoryFromCache(existCategory._id);

  return { id: existCategory._id };
};

// Uncache
export const getAllSubcategoriesService = async (payload) => {
  const existCategory = await getCategoryByIdRepository(payload.categoryId);
  Assert.isTrue(
    existCategory,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' }),
  );

  const filters = {
    $or: CATEGORY_SEARCH_FIELDS.map((field) => ({
      [field]: { $regex: payload.keyword, $options: 'i' },
    })),
  };

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, categories] = await getAndCountCategoriesRepository(
    existCategory._id,
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  return [totalCount, categories];
};
