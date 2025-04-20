import { HttpException } from '#src/core/exception/http-exception';
import {
  getCategoryByIdService,
  updateCategoryInfoByIdService,
  removeCategoryByIdService,
  checkExistCategoryNameService,
  getAndCountCategoriesService,
  newCategoryService,
  saveCategoryService,
  countSubcategoriesService,
} from '#src/app/categories/categories.service';
import { CategoryDto } from '#src/app/categories/dtos/category.dto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { Code } from '#src/core/code/Code';
import { MAXIMUM_CHILDREN_CATEGORY_LEVEL } from '#src/app/categories/categories.constant';

export const isExistCategoryNameController = async (req) => {
  const { name } = req.body;

  const isExistName = await checkExistCategoryNameService(name);

  return ApiResponse.success(isExistName, isExistName ? 'Category name exists' : 'Category name does not exist');
};

export const createCategoryController = async (req) => {
  const { name, parentId, image } = req.body;

  const isExistName = await checkExistCategoryNameService(name);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exists' });
  }

  const category = newCategoryService({ ...req.body, level: 1 });

  if (parentId) {
    const existParent = await getCategoryByIdService(parentId);
    if (!existParent) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Parent category not found' });
    }
    category.parent = existParent._id;

    const nextCategoryLevel = existParent.level + 1;
    if (nextCategoryLevel > MAXIMUM_CHILDREN_CATEGORY_LEVEL) {
      throw HttpException.new({
        code: Code.BAD_REQUEST,
        overrideMessage: `Parent category has a maximum ${MAXIMUM_CHILDREN_CATEGORY_LEVEL} levels only`,
      });
    }
    category.level = nextCategoryLevel;
  }

  if (image) {
    const result = await uploadImageBufferService({ buffer: req.file.buffer, folderName: 'categories-image' });
    category.image = result.url;
  }

  await saveCategoryService(category);

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
  const [totalCount, categories] = await getAndCountCategoriesService(null, filters, skip, limit, sortBy, sortOrder);

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

  if (image instanceof Buffer) {
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

  const subcategoryCount = await countSubcategoriesService(existCategory._id);
  if (subcategoryCount > 0) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Category includes subcategories' });
  }

  await removeCategoryByIdService(categoryId);

  return ApiResponse.success({ id: existCategory._id }, 'Remove category successful');
};

export const getAllSubcategoriesController = async (req) => {
  const { categoryId } = req.params;
  const existCategory = await getCategoryByIdService(categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const searchFields = ['name'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: 'i' },
    })),
  };

  const skip = (page - 1) * limit;
  const [totalCount, categories] = await getAndCountCategoriesService(
    existCategory._id,
    filters,
    skip,
    limit,
    sortBy,
    sortOrder,
  );

  const categoriesDto = ModelDto.newList(CategoryDto, categories);

  return ApiResponse.success({ totalCount, list: categoriesDto }, 'Get all subcategories successful');
};
