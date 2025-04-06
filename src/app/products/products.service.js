import { isValidObjectId } from "mongoose";
import { ProductModel } from "#src/app/products/models/product.model";
import { makeSlug } from "#src/utils/string.util";

const SELECTED_FIELDS =
  "_id name slug shortDescription content category subCategory productVariants createdAt updatedAt removedAt";

/**
 * New product
 * @param {*} data
 * @returns
 */
export function newProductService(data) {
  data.slug = makeSlug(data.name);
  return new ProductModel(data)
}

/**
 * Create products
 * @param {*} data
 * @returns
 */
export async function createProductsService(data, session) {
  data = data.map(item => ({ ...item, slug: makeSlug(item.name) }))
  return ProductModel.create(data, {
    session
  });
}

/**
 * Get all products
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductsService({
  filters,
  page,
  limit,
  sortBy,
  sortOrder,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductModel.find(filters)
    .skip((page - 1) * limit)
    .limit(limit)
    .select(selectFields)
    .sort({ [sortBy]: sortOrder });
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
    .populate('category')
    .populate({
      path: 'productVariants',
      populate: {
        path: 'variantValues',
        model: 'productVariants',
        populate: [
          {
            path: 'option',
            model: 'Option',
            select: '-optionValues'
          },
          {
            path: "optionValue",
            model: 'Option_Value'
          }
        ],
      }
    })
    .populate({
      path: 'productVariants',
      populate: {
        path: 'productDiscount',
        model: 'Product_Discount',
        select: '-productVariant'
      }
    })
    .select(selectFields).lean();
}

/**
 * Update product by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductByIdService(id, data, session) {
  data.slug = makeSlug(data.name);
  return await ProductModel.findByIdAndUpdate(id, data, {
    new: true,
    session
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
      avgRating: avgRating,
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
      $addToSet: { productVariants: { $each: productVariantIds } }
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
      $pull: { productVariants: productVariantId }
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}