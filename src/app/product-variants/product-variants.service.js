import { isValidObjectId } from 'mongoose';
import { ProductVariantModel } from '#src/app/product-variants/models/product-variants.model';
import { PRODUCT_VARIANT_SELECT_FIELDS } from '#src/app/product-variants/product-variants.constant';

/**
 * New product variant instance
 * @param {*} data
 * @returns
 */
export function newProductVariantsService(data) {
  return new ProductVariantModel(data);
}

/**
 * Save product variant
 * @param {*} data
 * @returns
 */
export async function saveProductVariantService(productVariant, session) {
  return await productVariant.save({ session });
}

/**
 * Save product variant instance
 * @param {*} data
 * @returns
 */
export function saveProductVariantsService(data, session) {
  return ProductVariantModel.insertMany(data, { session, ordered: true });
}

/**
 * Create product variant
 * @param {*} data
 * @returns
 */
export async function createProductVariantsService(data, session) {
  return await ProductVariantModel.create(data, {
    session,
    ordered: true,
  });
}

/**
 * Insert list product variant
 * @param {object} data
 * @returns
 */
export async function insertProductVariantsService(data, session) {
  return await ProductVariantModel.insertMany(data, { session, ordered: true });
}

/**
 * Get all products variants
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductVariantsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = PRODUCT_VARIANT_SELECT_FIELDS,
}) {
  return ProductVariantModel.find(filters).skip(offset).limit(limit).select(selectFields).sort({ createdAt: -1 });
}

// /**
//  * Count all products variants
//  * @param {*} filters
//  * @returns
//  */
// export async function countAllProductVariantsService(filters) {
//   return ProductVariantModel.countDocuments(filters);
// }

/**
 * Find one product variant by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getProductVariantByIdService(id, selectFields = PRODUCT_VARIANT_SELECT_FIELDS) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.product;
  }

  return await ProductVariantModel.findOne(filter)
    .select(selectFields)
    .populate({
      path: 'product',
      select: 'name thumbnail',
    })
    .populate({
      path: 'variantValues',
      populate: [
        {
          path: 'option',
          select: 'name',
        },
        {
          path: 'optionValue',
          select: 'valueName',
        },
      ],
    });
}

/**
 * Update product variant by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductVariantByIdService(id, data, session) {
  return await ProductVariantModel.findByIdAndUpdate(id, data, {
    new: true,
    session,
    ordered: true,
  }).select(PRODUCT_VARIANT_SELECT_FIELDS);
}

export async function increaseProductVariantsQuantityByOrderService(orderDetails, session) {
  const bulkOperations = orderDetails.map((item) => ({
    updateOne: {
      filter: { _id: item.variantId },
      update: { $inc: { quantity: item.quantity } },
    },
  }));

  await ProductVariantModel.bulkWrite(bulkOperations, { session });
}

export async function decreaseProductVariantsQuantityByOrder(orderDetails, session) {
  const bulkOperations = orderDetails.map((item) => ({
    updateOne: {
      filter: { _id: item.variantId },
      update: { $inc: { quantity: -item.quantity } },
    },
  }));

  await ProductVariantModel.bulkWrite(bulkOperations, { session });
}

/**
 * Remove product variant by id
 * @param {*} id
 * @returns
 */
export async function removeProductVariantByIdService(id) {
  return await ProductVariantModel.findByIdAndDelete(id).select(PRODUCT_VARIANT_SELECT_FIELDS);
}

/**
 * Update product variant value by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateProductVariantValueByIdService(id, data, session) {
  return await ProductVariantModel.findByIdAndUpdate(
    id,
    {
      $push: { variantValues: data },
    },
    {
      new: true,
      session,
    },
  ).select(PRODUCT_VARIANT_SELECT_FIELDS);
}

/**
 * Update product discount by product variant id
 * @param {*} id
 * @param {*} productDiscountId
 * @returns
 */
export async function updateProductDiscountByProductVariantIdService(id, productDiscountId, session) {
  return await ProductVariantModel.findByIdAndUpdate(
    id,
    {
      productDiscount: productDiscountId,
    },
    {
      new: true,
      session,
    },
  ).select(PRODUCT_VARIANT_SELECT_FIELDS);
}

export async function removeProductVariantsByProductIdService(productId, session) {
  return await ProductVariantModel.deleteMany({ product: productId }, { session });
}

/**
 * Update product variant quantity by id
 * @param {*} id
 * @param {*} productDiscountId
 * @returns
 */
export async function updateProductVariantQuantityByIdService(id, quantity, session) {
  return await ProductVariantModel.findByIdAndUpdate(
    id,
    {
      quantity: quantity,
    },
    {
      new: true,
      session,
    },
  ).select(PRODUCT_VARIANT_SELECT_FIELDS);
}

export async function getTopProductVariantsService(limit) {
  return await ProductVariantModel.find()
    .sort({ sold: -1 })
    .limit(10)
    .select(PRODUCT_VARIANT_SELECT_FIELDS)
    .populate({
      path: 'product',
      select: '_id name slug thumbnail status',
      options: { lean: true },
      populate: [
        {
          path: 'category',
          select: '_id name slug',
          options: { lean: true },
        },
        {
          path: 'subCategory',
          select: '_id name slug',
          options: { lean: true },
        },
      ],
    })
    .populate({
      path: 'variantValues',
      populate: [
        { path: 'option', options: { lean: true }, select: '_id name' },
        { path: 'optionValue', options: { lean: true }, select: '_id valueName' },
      ],
    })
    .limit(limit)
    .lean();
}
