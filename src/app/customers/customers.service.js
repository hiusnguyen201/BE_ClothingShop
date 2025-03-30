import { UserModel } from '#src/app/users/models/user.model';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query';

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

export async function getAllVouchersInCustomerService(id, payload) {
  const { filters = {}, page, limit, sortBy, sortOrder } = payload;

  let queryOptions = {};
  queryOptions = extendQueryOptionsWithPagination({ page, limit }, queryOptions);
  queryOptions = extendQueryOptionsWithSort({ sortBy, sortOrder }, queryOptions);

  const user = await UserModel.findById(id)
    .populate({
      path: 'vouchers',
      options: {
        $elemMatch: filters,
        ...queryOptions,
      },
    })
    .select('vouchers')
    .lean();

  return user.vouchers;
}
