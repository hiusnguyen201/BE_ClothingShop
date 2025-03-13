import { isValidObjectId } from 'mongoose';
import { CategoryModel } from '#models/category.model';
import { removeImageByPublicIdService, uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { REGEX_PATTERNS } from '#core/constant';
import { makeSlug } from '#utils/string.util';

/**
 * Create category instance
 * @param {*} data
 * @returns
 */
export async function createCategoryService(data) {
  return new CategoryModel({ ...data, slug: makeSlug(data.name) });
}

/**
 * Save category
 * @param {*} data
 * @returns
 */
export async function saveCategoryService(categoryModel) {
  return categoryModel.save();
}

/**
 * Get all categories
 * @param {*} query
 * @returns
 */
export async function getAllCategoriesService({ filters, offset, limit }) {
  return CategoryModel.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 }).lean();
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

  return CategoryModel.findOne(filter).lean();
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
  }).lean();
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
  ).lean();
}

/**
 * Remove category by id
 * @param {*} id
 * @returns
 */
export async function removeCategoryByIdService(id, removerId) {
  return CategoryModel.findByIdAndSoftDelete(id, removerId).lean();
}

/**
 * Check is exist permission name
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistCategoryNameService(name, skipId) {
  const result = await CategoryModel.findOne(
    {
      _id: { $ne: skipId },
      $or: [
        {
          name,
        },
        {
          slug: makeSlug(name),
        },
      ],
    },
    '_id',
    { withDeleted: true },
  ).lean();
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
  ).lean();
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
  ).lean();
}
