import { Dto } from '#src/core/dto/Dto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { NotFoundException } from '#core/exception/http-exception';
import {
  addVoucherToCustomerService,
  checkClaimedVoucherService,
  countAllVouchersInCustomerService,
  getAllVouchersInCustomerService,
} from '#src/app/v1/customers/customers.service';
import { getVoucherByCodeService } from '#src/app/v1/vouchers/vouchers.service';
import { VoucherDto } from '#src/app/v1/vouchers/dtos/voucher.dto';

export const claimVoucherByCodeController = async (req) => {
  const { voucherCode } = req.body;
  const userId = req.user._id;

  const voucher = await getVoucherByCodeService(voucherCode);
  if (!voucher) {
    throw new NotFoundException('Voucher not found');
  }

  const isClaimed = await checkClaimedVoucherService(userId, 'vouchers');
  if (isClaimed) {
    throw new ConflictException('Voucher already claim');
  }

  await addVoucherToCustomerService(userId, voucher._id);

  return ApiResponse.success(true, 'Claim voucher by code successfully');
};

export const getAllVoucherFromCustomerController = async (req) => {
  const userId = req.user._id;

  const totalCount = await countAllVouchersInCustomerService(userId);
  const metaData = calculatePagination(page, limit, totalCount);

  const vouchers = await getAllVouchersInCustomerService(userId, {
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const vouchersDto = Dto.newList(VoucherDto, vouchers);
  return ApiResponse.success(
    {
      meta: metaData,
      list: vouchersDto,
    },
    'Get all vouchers successfully',
  );
};
