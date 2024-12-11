import { isValidObjectId } from "mongoose";
import { CategoryModel } from "#src/modules/categories/schemas/category.schema";
import {
  removeImages,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import {
  NotFoundException,
} from "#src/core/exception/http-exception";
import { slugify } from "#src/utils/slugify";

const SELECTED_FIELDS = "_id icon name slug status parentCategory isHidden";
const FOLDER_ICONS = "/categories/icons";


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
      throw new NotFoundException("Category not found");
    }
  }

  const category = await CategoryModel.create({
    ...data,
    slug: slugify(name)
  });

  if (file) {
    await updateCategoryIconByIdService(category._id, file);
  }
  return await findCategoryByIdService(category._id);
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
  let { keyword = "", status, itemPerPage = 10, page = 1 } = query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: "i" } }],
    [status && "status"]: status,
  };

  const totalItems = await CategoryModel.countDocuments(filterOptions);
  const totalPages = Math.ceil(totalItems / itemPerPage);

  if (page <= 0 || !page) {
    page = 1;
  } else if (page > totalPages && totalPages >= 1) {
    page = totalPages;
  }

  const offSet = (page - 1) * itemPerPage;

  const categories = await CategoryModel.find(filterOptions)
    .skip(offSet)
    .limit(itemPerPage)
    .select(selectFields);

  return {
    list: categories,
    meta: {
      offSet,
      itemPerPage,
      currentPage: page,
      totalPages,
      totalItems,
      isNext: page < totalPages,
      isPrevious: page > 1,
      isFirst: page > 1 && page <= totalPages,
      isLast: page >= 1 && page < totalPages,
    },
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
      throw new NotFoundException("Category not found");
    }
  }

  const existCategory = await findCategoryByIdService(id);
  if (!existCategory) {
    throw new NotFoundException("Category not found");
  }
  
  if (file) {
    if (existCategory.icon) await removeImages(existCategory.icon);
    data.icon = await updateCategoryIconByIdService(existCategory._id, file);
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
 * Update avatar by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
async function updateCategoryIconByIdService(id, file) {
  const folderName = `${FOLDER_ICONS}/${id}`;
  const result = await uploadImageBufferService({
    file,
    folderName,
  });

  return result.public_id;
}