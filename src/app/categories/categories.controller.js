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
import { validateSchema } from '#src/core/validations/request.validation';
import { CreateCategoryDto } from '#src/app/categories/dtos/create-category.dto';
import { UpdateCategoryDto } from '#src/app/categories/dtos/update-category.dto';
import { CheckExistCategoryNameDto } from '#src/app/categories/dtos/check-exist-category-name.dto';
import { GetListCategoryDto } from '#src/app/categories/dtos/get-list-category.dto';
import { GetCategoryDto } from '#src/app/categories/dtos/get-category.dto';
import { GetListSubcategoryDto } from '#src/app/categories/dtos/get-list-subcategory.dto';

export const isExistCategoryNameController = async (req) => {
  const adapter = await validateSchema(CheckExistCategoryNameDto, req.body);

  const isExistName = await checkExistCategoryNameService(adapter.name);

  return ApiResponse.success(isExistName, isExistName ? 'Category name exists' : 'Category name does not exist');
};

export const createCategoryController = async (req) => {
  const adapter = await validateSchema(CreateCategoryDto, req.body);

  const isExistName = await checkExistCategoryNameService(adapter.name);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exists' });
  }

  const category = newCategoryService({ ...adapter, level: 1 });

  if (adapter.parentId) {
    const existParent = await getCategoryByIdService(adapter.parentId);
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

  if (adapter.image) {
    const result = await uploadImageBufferService({ buffer: adapter.image, folderName: 'categories-image' });
    category.image = result.url;
  }

  await saveCategoryService(category);

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Create category successful');
};

export const getAllCategoriesController = async (req) => {
  const adapter = await validateSchema(GetListCategoryDto, req.query);

  const searchFields = ['name'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, categories] = await getAndCountCategoriesService(
    null,
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const categoriesDto = ModelDto.newList(CategoryDto, categories);
  return ApiResponse.success({ totalCount, list: categoriesDto }, 'Get all categories successful');
};

export const getCategoryByIdController = async (req) => {
  const adapter = await validateSchema(GetCategoryDto, req.params);

  const category = await getCategoryByIdService(adapter.categoryId);
  if (!category) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Get one category successful');
};

export const updateCategoryByIdController = async (req) => {
  const adapter = await validateSchema(UpdateCategoryDto, { ...req.params, ...req.body });

  const existCategory = await getCategoryByIdService(adapter.categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const isExistName = await checkExistCategoryNameService(adapter.name, existCategory._id);
  if (isExistName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Category name already exist' });
  }

  if (adapter.image instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: adapter.image, folderName: 'categories-image' });
    adapter.image = result.url;
  }

  const updatedCategory = await updateCategoryInfoByIdService(existCategory._id, adapter);

  const categoryDto = ModelDto.new(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Update category successful');
};

export const removeCategoryByIdController = async (req) => {
  const adapter = await validateSchema(GetCategoryDto, req.params);

  const existCategory = await getCategoryByIdService(adapter.categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const subcategoryCount = await countSubcategoriesService(existCategory._id);
  if (subcategoryCount > 0) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Category includes subcategories' });
  }

  await removeCategoryByIdService(existCategory._id);

  return ApiResponse.success({ id: existCategory._id }, 'Remove category successful');
};

export const getAllSubcategoriesController = async (req) => {
  const adapter = await validateSchema(GetListSubcategoryDto, { ...req.params, ...req.query });

  const existCategory = await getCategoryByIdService(adapter.categoryId);
  if (!existCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  const searchFields = ['name'];
  const filters = {
    $or: searchFields.map((field) => ({
      [field]: { $regex: adapter.keyword, $options: 'i' },
    })),
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, categories] = await getAndCountCategoriesService(
    existCategory._id,
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const categoriesDto = ModelDto.newList(CategoryDto, categories);
  return ApiResponse.success({ totalCount, list: categoriesDto }, 'Get all subcategories successful');
};

export const getAllCategoriesByCustomerController = async (req) => {
  const adapter = await validateSchema(GetListCategoryDto, req.query);

  const filters = {};

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, categories] = await getAndCountCategoriesService(
    null,
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const categoriesDto = ModelDto.newList(CategoryDto, categories);
  return ApiResponse.success({ totalCount, list: categoriesDto }, 'Get all categories successful');
};
