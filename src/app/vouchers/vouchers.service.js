import { isValidObjectId } from 'mongoose';
import { VoucherModel } from '#src/app/vouchers/models/voucher.model';

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
export async function getAllVouchersService({ filters, offset = 0, limit = 10 }) {
  return VoucherModel.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 }).lean();
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

  return await VoucherModel.findOne(filter).lean();
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
  }).lean();
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeVoucherByIdService(id) {
  return VoucherModel.findByIdAndSoftDelete(id).lean();
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

  return await VoucherModel.findOne(filter).lean();
}
