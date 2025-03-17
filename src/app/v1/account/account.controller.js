'use strict';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { HttpException } from '#src/core/exception/http-exception';
import {
  addVoucherToCustomerService,
  checkClaimedVoucherService,
  countAllVouchersInCustomerService,
  getAllVouchersInCustomerService,
} from '#src/app/v1/customers/customers.service';
import { getVoucherByCodeService } from '#src/app/v1/vouchers/vouchers.service';
import { VoucherDto } from '#src/app/v1/vouchers/dtos/voucher.dto';
import { checkExistEmailService, getUserByIdService, updateUserInfoByIdService } from '#src/app/v1/users/users.service';
import { UserDto } from '#src/app/v1/users/dtos/user.dto';
import { comparePasswordService } from '#src/app/v1/account/account.service';
import { changePasswordByIdService } from '#src/app/v1/auth/auth.service';
import { Code } from '#src/core/code/Code';

export const getProfileController = async (req) => {
  const user = await getUserByIdService(req.user.id);
  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const editProfileController = async (req) => {
  const userId = req.user.id;
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email, userId);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const updatedUser = await updateUserInfoByIdService(userId, req.body);

  const userDto = ModelDto.new(UserDto, updatedUser);
  return ApiResponse.success(userDto);
};

export const changePasswordController = async (req) => {
  const userId = req.user.id;
  const { password, newPassword } = req.body;

  const isMatch = await comparePasswordService(userId, password);
  if (!isMatch) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Password is not correct' });
  }

  await changePasswordByIdService(userId, newPassword);

  return ApiResponse.success(true);
};

export const claimVoucherByCodeController = async (req) => {
  const userId = req.user.id;
  const { voucherCode } = req.body;

  const voucher = await getVoucherByCodeService(voucherCode);
  if (!voucher) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Voucher not found' });
  }

  const isClaimed = await checkClaimedVoucherService(userId, voucher._id);
  if (isClaimed) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Voucher already claimed' });
  }

  await addVoucherToCustomerService(userId, voucher._id);

  return ApiResponse.success(true, 'Claim voucher by code successfully');
};

export const getAllVoucherFromCustomerController = async (req) => {
  const userId = req.user.id;

  const totalCount = await countAllVouchersInCustomerService(userId);
  const metaData = calculatePagination(page, limit, totalCount);

  const vouchers = await getAllVouchersInCustomerService(userId, {
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const vouchersDto = ModelDto.newList(VoucherDto, vouchers);
  return ApiResponse.success(
    {
      meta: metaData,
      list: vouchersDto,
    },
    'Get all vouchers successfully',
  );
};
