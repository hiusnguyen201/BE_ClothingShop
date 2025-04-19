import { isValidObjectId } from 'mongoose';
import { ProductVariantModel } from '#src/app/product-variants/models/product-variants.model';

const SELECTED_FIELDS = '_id quantity price sku image sold variantValues product productDiscount createdAt updatedAt';

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
 * Get all products variants
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllProductVariantsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
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
export async function getProductVariantByIdService(id, selectFields = SELECTED_FIELDS) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.product;
  }

  return await ProductVariantModel.findOne(filter)
    .select(selectFields)
    // .populate({
    //   path: 'product',
    //   model: 'Product',
    //   select: '-productVariants',
    // })
    .populate({
      path: 'variantValues',
      model: 'productVariants',
      populate: [
        {
          path: 'option',
          model: 'Option',
          select: '-optionValues',
        },
        {
          path: 'optionValue',
          model: 'Option_Value',
        },
      ],
    });
  // .populate({
  //   path: 'productDiscount',
  //   model: 'Product_Discount',
  // });
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
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product variant by id
 * @param {*} id
 * @returns
 */
export async function removeProductVariantByIdService(id) {
  return await ProductVariantModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
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
  ).select(SELECTED_FIELDS);
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
  ).select(SELECTED_FIELDS);
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
  ).select(SELECTED_FIELDS);
}
