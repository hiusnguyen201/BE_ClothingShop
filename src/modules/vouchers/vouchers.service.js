import { isValidObjectId } from "mongoose";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { calculatePagination } from "#src/utils/pagination.util";
import { VoucherModel } from "#src/modules/vouchers/schemas/voucher.schema";

const SELECTED_FIELDS =
  "_id code name maxUses discount startDate endDate uses isFixed";

/**
 * Create voucher
 * @param {*} data
 * @returns
 */
export async function createVoucherService(data) {
  return await VoucherModel.create(data);
}

/**
 * Find all vouchers
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllVouchersService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", limit = 10, page = 1, startDate, endDate } = query;

  const fillerByCreatedAt = {
    ...(startDate ? { $gte: startDate } : {}),
    ...(endDate ? { $lte: endDate } : {}),
  };
  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { code: { $regex: keyword, $options: "i" } },
    ],
    ...(Object.keys(fillerByCreatedAt).length
      ? { createdAt: fillerByCreatedAt }
      : {}),
  };

  const totalCount = await VoucherModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const vouchers = await VoucherModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    list: vouchers,
    meta: metaData,
  };
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
 * Update avatar by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateVoucherImageByIdService(id, file, currentImage) {
  if (currentImage) {
    removeImageByPublicIdService(currentImage);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: "image-voucher",
  });

  return await VoucherModel.findByIdAndUpdate(id, {
    image: result.public_id,
  }).select(SELECTED_FIELDS);
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
