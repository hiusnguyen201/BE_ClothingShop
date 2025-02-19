import { isValidObjectId } from "mongoose";
import { ProductModel } from "#src/modules/products/schemas/product.schema";
import { makeSlug } from "#src/utils/string.util";
import { getTagByIdService } from "#src/modules/tags/tags.service";
import { getAllProductReviewsService } from "#src/modules/product-reviews/product-reviews.service";

const SELECTED_FIELDS =
  "_id name slug price short_description content status is_hidden is_featured is_new avg_rating total_review category sub_category discount tags product_options createdAt updatedAt";

/**
 * Create product
 * @param {*} data
 * @returns
 */
export async function createProductService(data) {
  return await ProductModel.create(data);
}

/**
 * Get all products
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all products
 * @param {*} filters
 * @returns
 */
export async function countAllProductsService(filters) {
  return ProductModel.countDocuments(filters);
}

/**
 * Find one product by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return await ProductModel
    .findOne(filter)
    .populate({
      path: 'product_options',
      populate: {
        path: 'option_values',
        model: 'Option_Value'
      }
    })
    .populate('product_discount')
    .populate('tags')
    .select(selectFields);
}

/**
 * Update product by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductByIdService(id, data) {
  return await ProductModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Update tags by product id
 * @param {*} id
 * @param {*} tags
 * @returns
 */
export async function updateProductTagsByIdService(
  id,
  tags = []
) {
  const result = await Promise.all(
    tags.map(async (item) => {
      return getTagByIdService(item);
    })
  );

  return ProductModel.findByIdAndUpdate(
    id,
    {
      tags: result.filter(Boolean),
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Remove product by id
 * @param {*} id
 * @returns
 */
export async function removeProductByIdService(id) {
  return await ProductModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist product
 * @param {*} name
 * @param {*} skipId
 * @returns
 */
export async function checkExistProductNameService(name, skipId) {
  const product = await ProductModel.findOne({
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
  return Boolean(product);
}

/**
 * Show product
 * @param {*} id
 * @returns
 */
export async function showProductService(id) {
  return ProductModel.findByIdAndUpdate(
    id,
    {
      is_hidden: false,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Hide product
 * @param {*} id
 * @returns
 */
export async function hideProductService(id) {
  return ProductModel.findByIdAndUpdate(
    id,
    {
      is_hidden: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Update product discount by productId
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductDiscountByProductIdService(id, data) {
  return await ProductModel.findByIdAndUpdate(
    id,
    {
      product_discount: data
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Update product rating by productId
 * @param {*} id
 * @returns
 */
export async function updateProductRatingAndTotalReviewByProductIdService(id) {
  const filterOptions = {
    product: id
  };

  const reviews = await getAllProductReviewsService({
    filters: filterOptions
  });
  const reviewsLength = reviews.length;

  const rating = reviews.reduce(
    (accumulator, currentValue) => accumulator + currentValue.score,
    0);
  const avgRating = rating / reviewsLength;

  return await ProductModel.findByIdAndUpdate(
    id,
    {
      avg_rating: avgRating,
      total_review: reviewsLength
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}