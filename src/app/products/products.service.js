import { isValidObjectId } from 'mongoose';
import { ProductModel } from '#src/app/products/models/product.model';
import { makeSlug } from '#src/utils/string.util';
import { PRODUCT_SELECT_FIELDS } from '#src/app/products/products.constant';
import { CATEGORY_SELECTED_FIELDS } from '#src/app/categories/categories.constant';
import { REGEX_PATTERNS } from '#src/core/constant';

/**
 * Create product
 * @param {*} data
 * @returns
 */
export function createProductService(data) {
  data.slug = makeSlug(data.name);
  return ProductModel.create(data);
}

/**
 * Create products
 * @param {*} data
 * @returns
 */
export async function createProductsService(data, session) {
  data = data.map((item) => ({ ...item, slug: makeSlug(item.name) }));
  return ProductModel.create(data, {
    session,
  });
}

/**
 * Get all products
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductsService({ filters, page, limit, sortBy, sortOrder }) {
  return ProductModel.find(filters)
    .skip((page - 1) * limit)
    .limit(limit)
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
export async function getProductByIdService(id, selectFields = PRODUCT_SELECT_FIELDS) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.SLUG)) {
    filter.slug = id;
  } else {
    filter.name = id;
  }

  return ProductModel.findOne(filter)
    .populate({
      path: 'category',
      select: CATEGORY_SELECTED_FIELDS,
    })
    .populate({
      path: 'subCategory',
      select: CATEGORY_SELECTED_FIELDS,
    })
    .populate({
      path: 'productOptions',
      populate: [
        { path: 'option', options: { lean: true }, select: '_id name' },
        { path: 'optionValues', options: { lean: true }, select: '_id valueName' },
      ],
    })
    .populate({
      path: 'productVariants',
      populate: {
        path: 'variantValues',
        populate: [
          { path: 'option', options: { lean: true }, select: '_id name' },
          { path: 'optionValue', options: { lean: true }, select: '_id valueName' },
        ],
        options: { lean: true },
        select: '_id option optionValue',
      },
      select: '_id price product quantity sku variantValues',
    })
    .select(selectFields)
    .lean();
}

/**
 * Update product info by id
 * @param {*} id
 * @param {*} data
 * @returns``
 */
export async function updateProductInfoByIdService(id, data, session) {
  data.slug = makeSlug(data.name);
  return ProductModel.findByIdAndUpdate(id, data, {
    new: true,
    session,
  })
    .populate({
      path: 'productOptions',
      populate: [
        { path: 'option', options: { lean: true }, select: '_id name' },
        { path: 'optionValues', options: { lean: true }, select: '_id valueName' },
      ],
    })
    .populate({
      path: 'productVariants',
      populate: {
        path: 'variantValues',
        populate: [
          { path: 'option', options: { lean: true }, select: '_id name' },
          { path: 'optionValue', options: { lean: true }, select: '_id valueName' },
        ],
        options: { lean: true },
        select: '_id option optionValue',
      },
      select: '_id price product quantity sku variantValues',
      sort: {
        createdAt: 'asc',
      },
    })
    .lean();
}

/**
 * Update product by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductVariantsByIdService(id, data, session) {
  const { productOptions, productVariants } = data;
  return ProductModel.updateOne(
    { _id: id },
    {
      productOptions,
      productVariants,
    },
    {
      new: true,
      session,
    },
  );
}

/**
 * Remove product by id
 * @param {*} id
 * @returns
 */
export async function removeProductByIdService(id) {
  return await ProductModel.findByIdAndSoftDelete(id).select('_id');
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
  }).select('_id');
  return Boolean(product);
}
