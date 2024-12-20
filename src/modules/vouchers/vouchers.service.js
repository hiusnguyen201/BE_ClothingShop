import { isValidObjectId } from "mongoose";
import { VoucherModel } from "#src/modules/vouchers/schemas/voucher.schema";

const SELECTED_FIELDS =
  "_id code name description maxUses discount isFixed isPublic maxDiscount hasMaxDiscount minPrice startDate endDate createdAt updatedAt";

/**
 * Create voucher
 * @param {*} data
 * @returns
 */
export async function createVoucherService(data) {
  return await VoucherModel.create(data);
}

/**
 * Get all vouchers
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllVouchersService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return VoucherModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all vouchers
 * @param {*} filters
 * @returns
 */
export async function countAllVouchersService(filters) {
  return VoucherModel.countDocuments(filters);
}

/**
 * Find one voucher by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getVoucherByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.code = id;
  }

  return await VoucherModel.findOne(filter).select(selectFields);
}

/**
 * Update info user by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateVoucherByIdService(id, data) {
  return await VoucherModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeVoucherByIdService(id) {
  return await VoucherModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Check exist code
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistVoucherCodeService(code, skipId) {
  const voucher = await VoucherModel.findOne({
    _id: { $ne: skipId },
    code,
  }).select("_id");
  return Boolean(voucher);
}

/**
 * Get one user by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getVoucherByCodeService(
  code,
  selectFields = SELECTED_FIELDS
) {
  if (!code) return null;
  const filter = { code };

  return await VoucherModel.findOne(filter).select(selectFields);
}
