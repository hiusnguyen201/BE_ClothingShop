'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import {
  createCategoryService,
  getCategoryByIdService,
  updateCategoryInfoByIdService,
  removeCategoryByIdService,
  checkExistCategoryNameService,
  getAndCountCategoriesService,
} from '#src/app/categories/categories.service';
import { CategoryDto } from '#src/app/categories/dtos/category.dto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { Code } from '#src/core/code/Code';

const MAXIMUM_CHILDREN_CATEGORY_LEVEL = 2;

export const createCategoryController = async (req) => {
  const { name, parentId, image } = req.body;
  let level = 1;

  const isExistName = await checkExistCategoryNameService(name);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exists' });
  }

  if (parentId) {
    const existParent = await getCategoryByIdService(parentId);

    if (!existParent) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Parent category not found' });
    }

    const nextCategoryLevel = existParent.level + 1;
    if (nextCategoryLevel > MAXIMUM_CHILDREN_CATEGORY_LEVEL) {
      throw HttpException.new({
        code: Code.BAD_REQUEST,
        overrideMessage: `Parent category has a maximum ${MAXIMUM_CHILDREN_CATEGORY_LEVEL} levels only`,
      });
    }
    level = nextCategoryLevel;
  }

  if (image instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: req.file.buffer, folderName: 'categories-image' });
    req.body.image = result.url;
  }

  const category = await createCategoryService({ ...req.body, level });

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Create category successful');
};

export const getAllCategoriesController = async (req) => {
  const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const searchFields = ['name'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    })),
  };

  const skip = (page - 1) * limit;
  const [totalCount, categories] = await getAndCountCategoriesService(filters, skip, limit, sortBy, sortOrder);

  const categoriesDto = ModelDto.newList(CategoryDto, categories);

  return ApiResponse.success({ totalCount, list: categoriesDto }, 'Get all categories successful');
};

export const getCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const category = await getCategoryByIdService(categoryId);
  if (!category) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Get one category successful');
};

export const updateCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const { name, image } = req.body;

  const existCategory = await getCategoryByIdService(categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const isExistName = await checkExistCategoryNameService(name, categoryId);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exist' });
  }

  if (image) {
    const result = await uploadImageBufferService({ buffer: req.file.buffer, folderName: 'categories-image' });
    req.body.image = result.url;
  }

  const updatedCategory = await updateCategoryInfoByIdService(categoryId, req.body);

  const categoryDto = ModelDto.new(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Update category successful');
};

export const removeCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const existCategory = await getCategoryByIdService(categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  await removeCategoryByIdService(categoryId);

  return ApiResponse.success({ id: existCategory._id }, 'Remove category successful');
};

export const isExistCategoryNameController = async (req) => {
  const { name } = req.body;

  const isExistName = await checkExistCategoryNameService(name);

  return ApiResponse.success(isExistName, isExistName ? 'Category name exists' : 'Category name does not exist');
};
