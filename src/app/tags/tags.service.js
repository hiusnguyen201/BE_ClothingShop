import { isValidObjectId } from "mongoose";
import { TagModel } from "#src/app/tags/schemas/tag.schema";
import { makeSlug } from "#src/utils/string.util";

const SELECTED_FIELDS =
  "_id name slug products createdAt updatedAt";

/**
 * Create tag
 * @param {*} data
 * @returns
 */
export async function createTagService(data) {
  return await TagModel.create({
    ...data,
    slug: makeSlug(data.name)
  });
}

/**
 * Get all tags
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllTagsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return TagModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all tags
 * @param {*} filters
 * @returns
 */
export async function countAllTagsService(filters) {
  return TagModel.countDocuments(filters);
}

/**
 * Find one tag by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getTagByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.name = id;
  }

  return await TagModel.findOne(filter).select(selectFields);
}

/**
 * Update tag by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateTagByIdService(id, data) {
  return await TagModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove tag by id
 * @param {*} id
 * @returns
 */
export async function removeTagByIdService(id) {
  return await TagModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist tag
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistTagNameService(name, skipId) {
  const tag = await TagModel.findOne({
    $or: [
      {
        name,
      },
      {
        slug: makeSlug(name),
      },
    ],
    _id: { $ne: skipId },
  }).select("_id");
  return Boolean(tag);
}

export async function getOrCreateTagByName(name, productId) {
  const tag = await getTagByIdService(name);
  if (!tag) {
    const newTag = await createTagService({
      name,
      products: productId
    });
    return newTag;
  }
  return tag;
}

export async function updateProductTagByIdService(id, productId) {
  return await TagModel.findByIdAndUpdate(id,
    {
      $addToSet: {
        products: productId
      }
    }, {
    new: true,
  }).select(SELECTED_FIELDS);
}