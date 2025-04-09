import { isValidObjectId } from 'mongoose';
import { ProductModel } from '#src/app/products/models/product.model';
import { makeSlug } from '#src/utils/string.util';

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
export async function getProductByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return ProductModel.findOne(filter).lean();
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
    session,
  });
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
