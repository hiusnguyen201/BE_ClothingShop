import { isValidObjectId } from "mongoose";
import { ProductDiscountModel } from "#src/modules/product_discounts/schemas/product-discount.schema";
import {
  getProductByIdService,
  updateProductDiscountByProductIdService as updateProductDiscountByProductIdServiceImport
} from "#src/modules/products/products.service";

const SELECTED_FIELDS =
  "_id name amount is_fixed end_date product createdAt updatedAt";

/**
 * Create product discount
 * @param {*} data
 * @returns
 */
export async function createProductDiscountService(data) {
  const product = await getProductByIdService(data.product);
  if (!product) {
    return null;
  }
  if (product.price < data.amount) {
    return null;
  }
  return await ProductDiscountModel.create(data);
}

/**
 * Find one product discount by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductDiscountByIdService(
  id,
  selectFields = SELECTED_FIELDS,
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return await ProductDiscountModel.findOne(filter).select(selectFields);
}

/**
 * Get all product discounts
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductDiscountsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ProductDiscountModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all product discounts
 * @param {*} filters
 * @returns
 */
export async function countAllProductDiscountsService(filters) {
  return ProductDiscountModel.countDocuments(filters);
}

/**
 * Update product discount by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductDiscountByIdService(id, data) {
  const product = await getProductByIdService(data.product);
  if (!product) {
    return null;
  }
  if (product.price < data.amount) {
    return null;
  }

  return ProductDiscountModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product discount by id
 * @param {*} id
 * @returns
 */
export async function removeProductDiscountByIdService(id) {
  return await ProductDiscountModel.findByIdAndDelete(id)
    .select(SELECTED_FIELDS)
}

/**
 * Update product discount by product id
 * @param {*} id
 * @param {*} productDiscountId
 * @returns
 */
export async function updateProductDiscountByProductIdService(id, productDiscountId) {
  return await updateProductDiscountByProductIdServiceImport(id, productDiscountId)
}