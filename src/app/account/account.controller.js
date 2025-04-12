'use strict';
import { ModelDto } from '#src/core/dto/ModelDto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { HttpException } from '#src/core/exception/http-exception';
import {
  addVoucherToCustomerService,
  checkClaimedVoucherService,
  countAllVouchersInCustomerService,
  getAllVouchersInCustomerService,
} from '#src/app/customers/customers.service';
import { getVoucherByCodeService } from '#src/app/vouchers/vouchers.service';
import { VoucherDto } from '#src/app/vouchers/dtos/voucher.dto';
import { checkExistEmailService, getUserByIdService, updateUserInfoByIdService } from '#src/app/users/users.service';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { comparePasswordService } from '#src/app/account/account.service';
import { changePasswordByIdService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';

export const getProfileController = async (req) => {
  const user = await getUserByIdService(req.user.id);
  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto);
};

export const editProfileController = async (req) => {
  const userId = req.user.id;
  const { email } = req.body;

  if (email) {
    const isExistEmail = await checkExistEmailService(email, userId);
    if (isExistEmail) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
    }
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
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Password is incorrect' });
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

  return ApiResponse.success(true, 'Claim voucher by code successful');
};

export const getAllVoucherFromCustomerController = async (req) => {
  const userId = req.user.id;
  const { page, limit, sortBy, sortOrder } = req.params;

  const totalCount = await countAllVouchersInCustomerService(userId);

  const vouchers = await getAllVouchersInCustomerService(userId, {
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const vouchersDto = ModelDto.newList(VoucherDto, vouchers);
  return ApiResponse.success(
    {
      totalCount,
      list: vouchersDto,
    },
    'Get all vouchers successful',
  );
};

// create order by customer
// export const createOrderCustomerController = async (req, res) => {
//   return TransactionalServiceWrapper.execute(async (session) => {
//     const newOderByCustomer = await handleCreateOrder(req.body.cartIds, req, session);
//     return {
//       message: 'Create order by customer successfully',
//       data: newOderByCustomer,
//     };
//   });
// };
