'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryInfoByIdService,
  removeCategoryByIdService,
  checkExistCategoryNameService,
  showCategoryService,
  hideCategoryService,
  countAllCategoriesService,
  saveCategoryService,
} from '#src/app/v1/categories/categories.service';
import { CategoryDto } from '#src/app/v1/categories/dtos/category.dto';
import { makeSlug } from '#src/utils/string.util';
import { calculatePagination } from '#src/utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { Code } from '#src/core/code/Code';

const MAXIMUM_CHILDREN_CATEGORY_LEVEL = 2;

export const createCategoryController = async (req) => {
  let { name, parent, level = 1 } = req.body;
  const isExistName = await checkExistCategoryNameService(name);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exist' });
  }

  if (parent) {
    const existParent = await getCategoryByIdService(parent);

    if (!existParent) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Parent category not found' });
    }

    if (existParent.isHide) {
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Parent category is hidden' });
    }

    const nextCategoryLevel = existParent.level + 1;
    if (nextCategoryLevel > MAXIMUM_CHILDREN_CATEGORY_LEVEL) {
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Parent category is reach limit' });
    }
    level = nextCategoryLevel;
  }

  const category = await createCategoryService({ ...req.body, level });

  // Update Image
  if (req.file) {
    const result = await uploadImageBufferService({ buffer: req.file.buffer, folderName: 'categories-image' });
    category.image = result.url;
  }

  await saveCategoryService(category);

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Create category successfully');
};

export const getAllCategoriesController = async (req) => {
  let { keyword = '', isHide = false, limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }],
    ...(isHide ? { isHide } : {}),
  };

  const totalCount = await countAllCategoriesService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const categories = await getAllCategoriesService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const categoriesDto = ModelDto.newList(CategoryDto, categories);
  return ApiResponse.success(
    {
      meta: metaData,
      list: categoriesDto,
    },
    'Get all categories successfully',
  );
};

export const getCategoryByIdController = async (req) => {
  const { id } = req.params;
  const category = await getCategoryByIdService(id);
  if (!category) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const categoryDto = ModelDto.newList(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Get one category successfully');
};

export const updateCategoryByIdController = async (req) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, 'id');
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const { name } = req.body;
  if (name) {
    const isExistName = await checkExistCategoryNameService(name, existCategory._id);
    if (isExistName) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exist' });
    }
    req.body.slug = makeSlug(name);
  }

  if (req.file) {
    const result = await uploadImageBufferService({ buffer: req.file.buffer, folderName: 'categories-image' });
    req.body.image = result.url;
  }

  const updatedCategory = await updateCategoryInfoByIdService(id, req.body);

  const categoryDto = ModelDto.newList(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Update category successfully');
};

export const removeCategoryByIdController = async (req) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (!existCategory.isHide) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Category is public' });
  }

  const removedCategory = await removeCategoryByIdService(id);

  const categoryDto = ModelDto.newList(CategoryDto, removedCategory);
  return ApiResponse.success(categoryDto, 'Remove category successfully');
};

export const isExistCategoryNameController = async (req) => {
  const { name } = req.body;
  const isExistName = await checkExistCategoryNameService(name);

  return ApiResponse.success(isExistName, isExistName ? 'Category name exists' : 'Category name does not exist');
};

export const showCategoryByIdController = async (req) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, 'id');
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  await showCategoryService(id);

  return ApiResponse.success(true, 'Show category successfully');
};

export const hideCategoryByIdController = async (req) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, 'id');
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  await hideCategoryService(id);

  return ApiResponse.success(true, 'Hide category successfully');
};
