'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryInfoByIdService,
  removeCategoryByIdService,
  checkExistCategoryNameService,
  activateCategoryService,
  deactivateCategoryService,
  countAllCategoriesService,
} from '#src/app/categories/categories.service';
import { CategoryDto } from '#src/app/categories/dtos/category.dto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { Code } from '#src/core/code/Code';
import { CATEGORY_STATUS } from '#src/app/categories/categories.constant';

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

    if (existParent.status === CATEGORY_STATUS.INACTIVE) {
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Parent category is inactive' });
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
  return ApiResponse.success(categoryDto, 'Create category successfully');
};

export const getAllCategoriesController = async (req) => {
  const { keyword, status, limit, page, sortBy, sortOrder } = req.query;

  const filters = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }],
    ...(status ? { status } : {}),
  };

  const totalCount = await countAllCategoriesService(filters);

  const categories = await getAllCategoriesService({
    filters,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const categoriesDto = ModelDto.newList(CategoryDto, categories);
  return ApiResponse.success(
    {
      totalCount,
      list: categoriesDto,
    },
    'Get all categories successfully',
  );
};

export const getCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const category = await getCategoryByIdService(categoryId);
  if (!category) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Get one category successfully');
};

export const updateCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const { name, image } = req.body;

  const existCategory = await getCategoryByIdService(categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (name) {
    const isExistName = await checkExistCategoryNameService(name, categoryId);
    if (isExistName) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exist' });
    }
  }

  if (image) {
    const result = await uploadImageBufferService({ buffer: req.file.buffer, folderName: 'categories-image' });
    req.body.image = result.url;
  }

  const updatedCategory = await updateCategoryInfoByIdService(categoryId, req.body);

  const categoryDto = ModelDto.new(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Update category successfully');
};

export const removeCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const existCategory = await getCategoryByIdService(categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (existCategory.status === CATEGORY_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Category is active' });
  }

  await removeCategoryByIdService(categoryId);

  return ApiResponse.success(null, 'Remove category successfully');
};

export const isExistCategoryNameController = async (req) => {
  const { name } = req.body;

  const isExistName = await checkExistCategoryNameService(name);

  return ApiResponse.success(isExistName, isExistName ? 'Category name exists' : 'Category name does not exist');
};

export const activateCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const existCategory = await getCategoryByIdService(categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (existCategory.status === CATEGORY_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Category is active' });
  }

  const updatedCategory = await activateCategoryService(categoryId);

  const categoryDto = ModelDto.new(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Activate category successfully');
};

export const deactivateCategoryByIdController = async (req) => {
  const { categoryId } = req.params;
  const existCategory = await getCategoryByIdService(categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (existCategory.status === CATEGORY_STATUS.INACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Category is inactive' });
  }

  const updatedCategory = await deactivateCategoryService(categoryId);

  const categoryDto = ModelDto.new(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Deactivate category successfully');
};
