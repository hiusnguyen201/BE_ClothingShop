import { isValidObjectId } from "mongoose";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { calculatePagination } from "#src/utils/pagination.util";
import { VoucherModel } from "#src/modules/vouchers/schemas/voucher.schema";
import { randomVocherCode } from "#src/utils/string.util";

const SELECTED_FIELDS =
  "_id code name maxUses discount startDate endDate uses isFixed";

/**
 * Create voucher
 * @param {*} data
 * @returns
 */
export async function createVoucherService(data) {
  const { code, file } = data;
  const isExistVoucher = await checkExistVoucherCodeService(code);
  if (isExistVoucher) {
    throw new BadRequestException("Voucher already exist");
  }

  if (file) {
    const result = await uploadImageBufferService({
      file,
      folderName: "voucher-image",
    });
    data.image = result.public_id;
  }
  const newVoucher = await VoucherModel.create({
    ...data,
    code: code,
  });
  return await findVoucherByIdService(newVoucher._id);
}

/**
 * Find all vouchers
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function findAllVouchersService(
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
export async function findVoucherByIdService(
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
  const { maxUses, file } = data;

  const existVoucher = await findVoucherByIdService(id, "_id uses");
  if (!existVoucher) {
    throw new NotFoundException("Voucher not found");
  }

  if (maxUses < existVoucher.uses) {
    throw new BadRequestException(
      `maxUses must be greater than the number of ${existVoucher.uses} `
    );
  }
  if (file) {
    if (existVoucher.image) {
      removeImageByPublicIdService(existVoucher.avatar);
    }
    const result = await uploadImageBufferService({
      file,
      folderName: "voucher-image",
    });
    data.image = result.public_id;
  }
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
  const existVoucher = await findVoucherByIdService(id, "_id");
  if (!existVoucher) {
    throw new NotFoundException("Voucher not found");
  }

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
 * Update verified by id
 * @param {*} id
 * @returns
 */
export async function updateIsFixedByIdService(id) {
  return await VoucherModel.findByIdAndUpdate(
    id,
    {
      isFixed: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}
