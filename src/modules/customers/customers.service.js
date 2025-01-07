import { UserModel } from "#src/modules/users/schemas/user.schema";
import { getUserByIdService } from "#src/modules/users/users.service";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS =
  "_id avatar name email birthday gender createdAt updatedAt";

export async function addVoucherToCustomerService(userId, voucherId) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $push: { vouchers: voucherId } },
    { new: true }
  ).select(SELECTED_FIELDS);
}
export async function getAllVouchersByCustomerService(id, query) {
  let { limit = 10, page = 1 } = query;
  const user = await getUserByIdService(id, "vouchers");
  const metaData = calculatePagination(page, limit, user.vouchers.length);

  const userVouchers = await UserModel.findById(id)
    .populate({
      path: "vouchers",
      options: {
        skip: metaData.offset,
        limit: metaData.limit,
        sort: { createdAt: -1 },
      },
    })
    .select("vouchers");

  return {
    meta: metaData,
    list: userVouchers.vouchers,
  };
}
