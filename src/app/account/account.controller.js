import { NotFoundException } from '#core/exception/http-exception';
import HttpStatus from 'http-status-codes';
import { getVoucherByCodeService } from '#app/vouchers/vouchers.service';
import { getUserByIdService } from '#app/users/users.service';
import { addVoucherToCustomerService, getAllVouchersByCustomerService } from '#app/customers/customers.service';

export const claimVoucherByCodeController = async (req) => {
  const { voucherCode } = req.body;
  const userId = req.user._id;

  const voucher = await getVoucherByCodeService(voucherCode);
  if (!voucher) {
    throw new NotFoundException('Voucher not found');
  }

  const user = await getUserByIdService(userId, 'vouchers');

  if (user.vouchers.includes(voucher._id)) {
    throw new ConflictException('Voucher already claim');
  }

  await addVoucherToCustomerService(userId, voucher._id);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Claim voucher by code successfully',
  };
};

export const getAllVoucherFromCustomerController = async (req) => {
  const userId = req.user._id;

  const data = await getAllVouchersByCustomerService(userId, req.query);

  return {
    statusCode: HttpStatus.OK,
    message: 'Get customer successfully',
    data,
  };
};
