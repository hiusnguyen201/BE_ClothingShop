import { isValidObjectId } from "mongoose";
import { ProductModel } from "#src/app/products/models/product.model";
import { makeSlug } from "#src/utils/string.util";
import { getAllTagsService } from "#src/app/tags/tags.service";
import { getAllProductReviewsService } from "#src/app/product-reviews/product-reviews.service";

const SELECTED_FIELDS =
  "_id name slug short_description content status is_hidden is_featured is_new avg_rating total_review category sub_category discount tags product_variants createdAt updatedAt removedAt";

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

  const product = await ProductModel
    .findOne(filter)
    .populate('category')
    .populate({
      path: 'product_variants',
      populate: {
        path: 'variant_values',
        model: 'Product_Variant'
      }
    })
    .populate({
      path: 'product_variants',
      populate: {
        path: 'product_discount',
        model: 'Product_Discount',
        select: '-product_variant'
      }
    })
    .select(selectFields);

  // const tags = await getAllTagsService({
  //   filters: {
  //     products: id
  //   },
  //   selectFields: "_id"
  // });

  // if (tags && tags.length) {
  //   product.tags = tags.map(tag => tag._id);
  // }

  return product;
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
 * Remove product by id
 * @param {*} id
 * @returns
 */
export async function removeProductByIdService(id) {
  return await ProductModel.findByIdAndUpdate(id, {
    removedAt: new Date()
  }, { new: true }).select(SELECTED_FIELDS);
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

/**
 * Update product variant by productId
 * @param {*} id
 * @param {*} productVariantIds
 * @returns
 */
export async function updateProductVariantsByProductIdService(id, productVariantIds) {
  return await ProductModel.findByIdAndUpdate(
    id,
    {
      $addToSet: { product_variants: { $each: productVariantIds } }
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Remove product variant by productId
 * @param {*} id
 * @param {*} productVariantId
 * @returns
 */
export async function removeProductVariantsByProductIdService(id, productVariantId) {
  return await ProductModel.findByIdAndUpdate(
    id,
    {
      $pull: { product_variants: productVariantId }
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}