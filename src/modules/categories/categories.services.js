import { isValidObjectId } from "mongoose";
import { CategoryModel } from "#src/modules/categories/schemas/category.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { slugify } from "#src/utils/slugify.util";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS = "_id icon name slug status parentCategory isHidden";

/**
 * Create category
 * @param {*} data
 * @returns
 */
export async function createCategoryService(data) {
  const { file, name, parentCategory } = data;

  if (parentCategory) {
    const existParentCategory = await findCategoryByIdService(parentCategory);
    if (!existParentCategory) {
      throw new NotFoundException("Parent category not found");
    }
  }

  const isExistName = await checkExistCategoryNameService(name);
  if (isExistName) {
    throw new BadRequestException("Category name is exist");
  }

  if (file) {
    const result = await uploadImageBufferService({
      file,
      folderName: "categories-icon",
    });
    data.icon = result.public_id;
  }

  const category = await CategoryModel.create({
    ...data,
    slug: slugify(name)
  });
  return category;
}


/**
 * Find all categories
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function findAllCategoriesService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", status, limit = 10, page = 1 } = query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: "i" } }],
    [status && "status"]: status,
  };

  const totalCount = await CategoryModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const categories = await CategoryModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    list: categories,
    meta: metaData,
  };
}

/**
 * Find one category by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function findCategoryByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }

  return await CategoryModel.findOne(filter).select(selectFields);
}


/**
 * Update category by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateCategoryByIdService(id, data) {
  const { file, name, parentCategory } = data;

  if (parentCategory) {
    const existParentCategory = await findCategoryByIdService(parentCategory);
    if (!existParentCategory) {
      throw new NotFoundException("Parent category not found");
    }
  }

  const existCategory = await findCategoryByIdService(id);
  if (!existCategory) {
    throw new NotFoundException("Category not found");
  }

  if (name && existCategory.name !== name) {
    const isExistName = await checkExistCategoryNameService(name);
    if (isExistName) {
      throw new BadRequestException("Category name is exist");
    }
  }

  if (file) {
    if (existCategory.avatar) {
      removeImageByPublicIdService(existCategory.icon);
    }
    const result = await uploadImageBufferService({
      file,
      folderName: "categories-icon",
    });
    data.icon = result.public_id;
  }

  if (name) {
    data.slug = slugify(name);
  }

  const category = await CategoryModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);

  return category;
}

/**
 * Remove category by id
 * @param {*} id
 * @returns
 */
export async function removeCategoryByIdService(id) {
  const existCategory = await findCategoryByIdService(id, "_id");
  if (!existCategory) {
    throw new NotFoundException("Category not found");
  }

  return await CategoryModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
async function checkExistCategoryNameService(name, skipId) {
  const existCategory = await CategoryModel.findOne({
    name,
    _id: { $ne: skipId },
  }).select("_id");
  return Boolean(existCategory);
}