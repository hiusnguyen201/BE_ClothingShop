import {
  NotFoundException,
  ConflictException,
  PreconditionFailedException,
  BadRequestException,
} from '#core/exception/http-exception';
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
import { makeSlug } from '#utils/string.util';
import { calculatePagination } from '#utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { Dto } from '#src/core/dto/Dto';
import { uploadImageBufferService } from '#src/modules/cloudinary/CloudinaryService';

const MAX_LEVEL_CHILDREN = 2;

export const createCategoryController = async (req) => {
  let { name, parent, level = 1 } = req.body;
  const isExistName = await checkExistCategoryNameService(name);
  if (isExistName) {
    throw new ConflictException('Category name already exist');
  }

  if (parent) {
    const existParent = await getCategoryByIdService(parent);

    if (!existParent) {
      throw new NotFoundException('Parent category not found');
    }

    if (existParent.isHide) {
      throw new BadRequestException('Parent category is hidden');
    }

    const nextCategoryLevel = existParent.level + 1;
    if (nextCategoryLevel > MAX_LEVEL_CHILDREN) {
      throw new BadRequestException('Parent category is reach limit');
    }
    level = nextCategoryLevel;
  }

  const category = await createCategoryService({
    ...req.body,
    level,
  });

  // Update Image
  if (req.file) {
    const result = await uploadImageBufferService({ file: req.file, folderName: 'categories-image' });
    category.image = result.url;
  }

  await saveCategoryService(category);

  const categoryDto = Dto.new(CategoryDto, category);
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

  const categoriesDto = Dto.newList(CategoryDto, categories);
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
    throw new NotFoundException('Category not found');
  }

  const categoryDto = Dto.newList(CategoryDto, category);
  return ApiResponse.success(categoryDto, 'Get one category successfully');
};

export const updateCategoryByIdController = async (req) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, 'id');
  if (!existCategory) {
    throw new NotFoundException('Category not found');
  }

  const { name } = req.body;
  if (name) {
    const isExistName = await checkExistCategoryNameService(name, existCategory._id);
    if (isExistName) {
      throw new ConflictException('Category name already exist');
    }
    req.body.slug = makeSlug(name);
  }

  if (req.file) {
    const result = await uploadImageBufferService({ file: req.file, folderName: 'categories-image' });
    req.body.image = result.url;
  }

  const updatedCategory = await updateCategoryInfoByIdService(id, req.body);

  const categoryDto = Dto.newList(CategoryDto, updatedCategory);
  return ApiResponse.success(categoryDto, 'Update category successfully');
};

export const removeCategoryByIdController = async (req) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id);
  if (!existCategory) {
    throw new NotFoundException('Category not found');
  }

  if (!existCategory.isHide) {
    throw new PreconditionFailedException('Category is public');
  }

  const removedCategory = await removeCategoryByIdService(id);

  const categoryDto = Dto.newList(CategoryDto, removedCategory);
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
    throw new NotFoundException('Category not found');
  }

  await showCategoryService(id);

  return ApiResponse.success(true, 'Show category successfully');
};

export const hideCategoryByIdController = async (req) => {
  const { id } = req.params;
  const existCategory = await getCategoryByIdService(id, 'id');
  if (!existCategory) {
    throw new NotFoundException('Category not found');
  }

  await hideCategoryService(id);

  return ApiResponse.success(true, 'Hide category successfully');
};
