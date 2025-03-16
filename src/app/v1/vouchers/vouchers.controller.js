import { ConflictException, NotFoundException, PreconditionFailedException } from '#src/core/exception/http-exception';

import {
  createVoucherService,
  getAllVouchersService,
  getVoucherByIdService,
  updateVoucherByIdService,
  removeVoucherByIdService,
  checkExistVoucherCodeService,
  countAllVouchersService,
} from '#src/app/v1/vouchers/vouchers.service';
import { calculatePagination } from '#src/utils/pagination.util';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { VoucherDto } from '#src/app/v1/vouchers/dtos/voucher.dto';

export const createVoucherController = async (req) => {
  const { code } = req.body;
  const isExistVoucherCode = await checkExistVoucherCodeService(code);
  if (isExistVoucherCode) {
    throw new NotFoundException('Voucher code already exist');
  }

  const newVoucher = await createVoucherService(req.body);

  const voucherDto = ModelDto.new(VoucherDto, newVoucher);
  return ApiResponse.success(voucherDto, 'Create voucher successfully');
};

export const getAllVouchersController = async (req) => {
  let { keyword = '', limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }, { code: { $regex: keyword, $options: 'i' } }],
  };

  const totalCount = await countAllVouchersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const vouchers = await getAllVouchersService({
    filters: filterOptions,
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

export const getVoucherByIdController = async (req) => {
  const { id } = req.params;
  const voucher = await getVoucherByIdService(id);
  if (!voucher) {
    throw new ConflictException('Voucher code already exist');
  }

  const voucherDto = ModelDto.new(VoucherDto, voucher);
  return ApiResponse.success(voucherDto, 'Get one voucher successfully');
};

export const updateVoucherByIdController = async (req) => {
  const { id } = req.params;
  const existVoucher = await getVoucherByIdService(id, 'id uses');
  if (!existVoucher) {
    throw new ConflictException('Voucher code already exist');
  }

  const { maxUses } = req.body;
  if (maxUses < existVoucher.uses) {
    throw new PreconditionFailedException(`maxUses must be greater than the number of ${existVoucher.uses} `);
  }
  const updatedVoucher = await updateVoucherByIdService(id, req.body);

  const voucherDto = ModelDto.new(VoucherDto, updatedVoucher);
  return ApiResponse.success(voucherDto, 'Update voucher successfully');
};

export const removeVoucherByIdController = async (req) => {
  const { id } = req.params;
  const existVoucher = await getVoucherByIdService(id, 'id');
  if (!existVoucher) {
    throw new ConflictException('Voucher code already exist');
  }

  const removeVoucher = await removeVoucherByIdService(id);

  const voucherDto = ModelDto.new(VoucherDto, removeVoucher);
  return ApiResponse.success(voucherDto, 'Remove voucher successfully');
};

export const isExistVoucherCodeController = async (req) => {
  const { code } = req.body;
  const isExistCode = await checkExistVoucherCodeService(code);

  return ApiResponse.success(isExistCode, isExistCode ? 'Voucher code exists' : 'Voucher code does not exist');
};
