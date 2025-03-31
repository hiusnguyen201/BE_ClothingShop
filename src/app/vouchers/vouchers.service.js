import { isValidObjectId } from 'mongoose';
import { VoucherModel } from '#src/app/vouchers/models/voucher.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { VOUCHER_SELECTED_FIELDS } from '#src/app/vouchers/vouchers.constant';

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
 * @returns
 */
export async function getAllVouchersService(payload) {
  const { filters = {}, page, limit, sortBy, sortOrder } = payload;

  let queryOptions = {};
  queryOptions = extendQueryOptionsWithPagination({ page, limit }, queryOptions);
  queryOptions = extendQueryOptionsWithSort({ sortBy, sortOrder }, queryOptions);

  return VoucherModel.find(filters, VOUCHER_SELECTED_FIELDS, queryOptions).lean();
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
 * @returns
 */
export async function getVoucherByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.code = id;
  }

  return await VoucherModel.findOne(filter).select(VOUCHER_SELECTED_FIELDS).lean();
}

/**
 * Update info user by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateVoucherByIdService(id, data) {
  return VoucherModel.findByIdAndUpdate(id, data, {
    new: true,
  })
    .select(VOUCHER_SELECTED_FIELDS)
    .lean();
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeVoucherByIdService(id) {
  return VoucherModel.findByIdAndSoftDelete(id).select('_id').lean();
}

/**
 * Check exist code
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistVoucherCodeService(code, skipId) {
  const filters = { code };

  if (skipId) {
    filters._id = { $ne: skipId };
  }

  const result = await VoucherModel.findOne(filters, '_id', { withRemoved: true });
  return !!result;
}

/**
 * Get one user by id
 * @param {*} id
 * @returns
 */
export async function getVoucherByCodeService(code) {
  if (!code) return null;
  const filter = { code };

  return await VoucherModel.findOne(filter).select(VOUCHER_SELECTED_FIELDS).lean();
}
