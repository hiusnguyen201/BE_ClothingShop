import { UserModel } from '#src/app/users/models/user.model';
import { USER_SELECTED_FIELDS, USER_TYPE } from '#src/app/users/users.constant';
import { REGEX_PATTERNS } from '#src/core/constant';
import { isValidObjectId } from 'mongoose';

export async function addVoucherToCustomerService(userId, voucherId) {
  return UserModel.findByIdAndUpdate(userId, { $push: { vouchers: voucherId } }, { new: true }).lean();
}

export async function countAllVouchersInCustomerService(id) {
  const user = await UserModel.findById(id).select('vouchers').lean();
  return user.vouchers.length;
}

export async function checkClaimedVoucherService(userId, voucherId) {
  return !!UserModel.findOne({
    _id: userId,
    vouchers: {
      $elemMatch: { _id: voucherId },
    },
  })
    .select('_id')
    .lean();
}

export async function getAllVouchersInCustomerService(id, { offset, limit }) {
  const user = await UserModel.findById(id)
    .populate({
      path: 'vouchers',
      options: {
        skip: offset,
        limit: limit,
        sort: { createdAt: -1 },
      },
    })
    .select('vouchers')
    .lean();

  return user.vouchers;
}

export async function getCustomerByIdService(id) {
  if (!id) return null;
  const filter = {
    type: USER_TYPE.CUSTOMER,
  };

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.EMAIL)) {
    filter.email = id;
  } else {
    return null;
  }
  return UserModel.findOne(filter).select(USER_SELECTED_FIELDS).lean();
}
