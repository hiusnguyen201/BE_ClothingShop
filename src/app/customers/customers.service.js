import { UserModel } from '#src/app/users/models/user.model';

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
