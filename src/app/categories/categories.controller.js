import {
  getCategoryByIdService,
  removeCategoryByIdService,
  checkExistCategoryNameService,
  createCategoryService,
  getAllCategoriesService,
  getAllSubcategoriesService,
  updateCategoryByIdService,
} from '#src/app/categories/categories.service';
import { CategoryDto } from '#src/app/categories/dtos/category.dto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { validateSchema } from '#src/core/validations/request.validation';
import { CreateCategoryDto } from '#src/app/categories/dtos/create-category.dto';
import { UpdateCategoryDto } from '#src/app/categories/dtos/update-category.dto';
import { CheckExistCategoryNameDto } from '#src/app/categories/dtos/check-exist-category-name.dto';
import { GetListCategoryDto } from '#src/app/categories/dtos/get-list-category.dto';
import { GetCategoryDto } from '#src/app/categories/dtos/get-category.dto';
import { GetListSubcategoryDto } from '#src/app/categories/dtos/get-list-subcategory.dto';
import { generateCategoryExcelBufferService } from '#src/modules/file-handler/excel/category-excel.service';

export const isExistCategoryNameController = async (req) => {
  const adapter = await validateSchema(CheckExistCategoryNameDto, req.body);

  const isExistName = await checkExistCategoryNameService(adapter);

  return ApiResponse.success(isExistName, isExistName ? 'Category name exists' : 'Category name does not exist');
};

export const createCategoryController = async (req) => {
  const adapter = await validateSchema(CreateCategoryDto, req.body);

  const category = await createCategoryService(adapter);

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Create category successful');
};

export const getAllCategoriesController = async (req) => {
  const adapter = await validateSchema(GetListCategoryDto, req.query);

  const [totalCount, categories] = await getAllCategoriesService(adapter);

  const categoriesDto = ModelDto.newList(CategoryDto, categories);
  return ApiResponse.success({ totalCount, list: categoriesDto }, 'Get all categories successful');
};

export const exportCategoriesController = async (req, res) => {
  const adapter = await validateSchema(GetListCategoryDto, req.query);

  const [_, categories] = await getAllCategoriesService(adapter);

  const { buffer, fileName, contentType } = await generateCategoryExcelBufferService([
    ...categories,
    ...categories.flatMap((item) => item.children),
  ]);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
};

export const getCategoryByIdController = async (req) => {
  const adapter = await validateSchema(GetCategoryDto, req.params);

  const category = await getCategoryByIdService(adapter);

  const categoryDto = ModelDto.new(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Get one category successful');
};

export const updateCategoryByIdController = async (req) => {
  const adapter = await validateSchema(UpdateCategoryDto, { ...req.params, ...req.body });

  const updatedCategory = await updateCategoryByIdService(adapter);

  const categoryDto = ModelDto.new(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Update category successful');
};

export const removeCategoryByIdController = async (req) => {
  const adapter = await validateSchema(GetCategoryDto, req.params);

  const data = await removeCategoryByIdService(adapter);

  return ApiResponse.success(data, 'Remove category successful');
};

// Uncache
export const getAllSubcategoriesController = async (req) => {
  const adapter = await validateSchema(GetListSubcategoryDto, { ...req.params, ...req.query });

  const [totalCount, categories] = await getAllSubcategoriesService(adapter);

  const categoriesDto = ModelDto.newList(CategoryDto, categories);
  return ApiResponse.success({ totalCount, list: categoriesDto }, 'Get all subcategories successful');
};
