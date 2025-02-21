import { UserModel } from '#src/app/users/models/user.model';
import { getUserByIdService } from '#app/users/users.service';
import { calculatePagination } from '#utils/pagination.util';

export async function addVoucherToCustomerService(userId, voucherId) {
  return UserModel.findByIdAndUpdate(userId, { $push: { vouchers: voucherId } }, { new: true });
}

export async function getAllVouchersByCustomerService(id, query) {
  let { limit = 10, page = 1 } = query;
  const user = await getUserByIdService(id, 'vouchers');
  const metaData = calculatePagination(page, limit, user.vouchers.length);

  const userVouchers = await UserModel.findById(id)
    .populate({
      path: 'vouchers',
      options: {
        skip: metaData.offset,
        limit: metaData.limit,
        sort: { createdAt: -1 },
      },
    })
    .select('vouchers');

  return {
    meta: metaData,
    list: userVouchers.vouchers,
  };
}
