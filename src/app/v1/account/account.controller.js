import { NotFoundException } from '#core/exception/http-exception';
import HttpStatus from 'http-status-codes';
import { getVoucherByCodeService } from '#src/app/v1/vouchers/vouchers.service';
import { getUserByIdService } from '#src/app/v1/users/users.service';
import { addVoucherToCustomerService, getAllVouchersByCustomerService } from '#src/app/v1/customers/customers.service';

export const claimVoucherByCodeController = async (req) => {
  const { voucherCode } = req.body;
  const userId = req.user.id;

  const voucher = await getVoucherByCodeService(voucherCode);
  if (!voucher) {
    throw new NotFoundException('Voucher not found');
  }

  const user = await getUserByIdService(userId, 'vouchers');

  if (user.vouchers.includes(voucher.id)) {
    throw new ConflictException('Voucher already claim');
  }

  await addVoucherToCustomerService(userId, voucher.id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Claim voucher by code successfully',
  };
};

export const getAllVoucherFromCustomerController = async (req) => {
  const userId = req.user.id;

  const data = await getAllVouchersByCustomerService(userId, req.query);

  return {
    statusCode: HttpStatus.OK,
    message: 'Get customer successfully',
    data,
  };
};
