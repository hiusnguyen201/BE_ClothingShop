import { isValidObjectId } from 'mongoose';
import { CategoryModel } from '#src/app/categories/models/category.model';
import { removeImageByPublicIdService, uploadImageBufferService } from '#modules/cloudinary/cloudinary.service';
import { REGEX_PATTERNS } from '#core/constant';
import { makeSlug } from '#utils/string.util';

/**
 * Create category
 * @param {*} data
 * @returns
 */
export async function createCategoryService(data) {
  return CategoryModel.create(data);
}

/**
 * Get all categories
 * @param {*} query
 * @returns
 */
export async function getAllCategoriesService({ filters, offset, limit }) {
  return CategoryModel.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 });
}

/**
 * Count all categories
 * @param {*} filters
 * @returns
 */
export async function countAllCategoriesService(filters) {
  return CategoryModel.countDocuments(filters);
}

/**
 * Get one category by id
 * @param {*} id
 * @returns
 */
export async function getCategoryByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return CategoryModel.findOne(filter);
}

/**
 * Update info category by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateCategoryInfoByIdService(id, data) {
  return CategoryModel.findByIdAndUpdate(id, data, {
    new: true,
  });
}

/**
 * Update image category by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateCategoryImageByIdService(id, file, currentImage) {
  if (currentImage) {
    removeImageByPublicIdService(currentImage);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: 'categories-image',
  });

  return CategoryModel.findByIdAndUpdate(
    id,
    {
      image: result.public_id,
    },
    { new: true },
  );
}

/**
 * Remove category by id
 * @param {*} id
 * @returns
 */
export async function removeCategoryByIdService(id) {
  return CategoryModel.findByIdAndSoftDelete(id);
}

/**
 * Check is exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistCategoryNameService(name, skipId) {
  const result = await CategoryModel.exists({
    $or: [
      {
        name,
      },
      {
        slug: makeSlug(name),
      },
    ],
    _id: { $ne: skipId },
  });
  return !!result;
}

/**
 * Show category
 * @param {*} id
 * @returns
 */
export async function showCategoryService(id) {
  return CategoryModel.findByIdAndUpdate(
    id,
    {
      isHide: false,
    },
    { new: true },
  );
}

/**
 * Hide category
 * @param {*} id
 * @returns
 */
export async function hideCategoryService(id) {
  return CategoryModel.findByIdAndUpdate(
    id,
    {
      isHide: true,
    },
    { new: true },
  );
}
