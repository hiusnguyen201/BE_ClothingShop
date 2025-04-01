'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import {
  createVoucherService,
  getAllVouchersService,
  getVoucherByIdService,
  updateVoucherByIdService,
  removeVoucherByIdService,
  checkExistVoucherCodeService,
  countAllVouchersService,
} from '#src/app/vouchers/vouchers.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { VoucherDto } from '#src/app/vouchers/dtos/voucher.dto';
import { Code } from '#src/core/code/Code';

export const createVoucherController = async (req) => {
  const { code } = req.body;
  const isExistVoucherCode = await checkExistVoucherCodeService(code);
  if (isExistVoucherCode) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Voucher code already exist' });
  }

  const newVoucher = await createVoucherService(req.body);

  const voucherDto = ModelDto.new(VoucherDto, newVoucher);
  return ApiResponse.success(voucherDto, 'Create voucher successfully');
};

export const getAllVouchersController = async (req) => {
  const { keyword, limit, page, sortBy, sortOrder } = req.query;

  const filters = {
    $or: [
      {
        name: { $regex: keyword, $options: 'i' },
      },
      {
        code: { $regex: keyword, $options: 'i' },
      },
    ],
  };

  const totalCount = await countAllVouchersService(filters);

  const vouchers = await getAllVouchersService({
    filters,
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
    'Get all vouchers successfully',
  );
};

export const getVoucherByIdController = async (req) => {
  const { id } = req.params;
  const voucher = await getVoucherByIdService(id);
  if (!voucher) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Voucher not found' });
  }

  const voucherDto = ModelDto.new(VoucherDto, voucher);
  return ApiResponse.success(voucherDto, 'Get one voucher successfully');
};

export const updateVoucherByIdController = async (req) => {
  const { id } = req.params;
  const existVoucher = await getVoucherByIdService(id, 'id uses');
  if (!existVoucher) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Voucher not found' });
  }

  const { maxUses } = req.body;
  if (maxUses < existVoucher.uses) {
    throw HttpException.new({
      code: Code.BAD_REQUEST,
      overrideMessage: `maxUses must be greater than the number of ${existVoucher.uses}`,
    });
  }
  const updatedVoucher = await updateVoucherByIdService(id, req.body);

  const voucherDto = ModelDto.new(VoucherDto, updatedVoucher);
  return ApiResponse.success(voucherDto, 'Update voucher successfully');
};

export const removeVoucherByIdController = async (req) => {
  const { id } = req.params;
  const existVoucher = await getVoucherByIdService(id, 'id');
  if (!existVoucher) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Voucher not found' });
  }

  await removeVoucherByIdService(id);

  return ApiResponse.success({ id: existVoucher._id }, 'Remove voucher successful');
};

export const isExistVoucherCodeController = async (req) => {
  const { code } = req.body;
  const isExistCode = await checkExistVoucherCodeService(code);

  return ApiResponse.success(isExistCode, isExistCode ? 'Voucher code exists' : 'Voucher code does not exist');
};
