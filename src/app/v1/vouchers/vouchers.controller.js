import HttpStatus from 'http-status-codes';
import { ConflictException, NotFoundException, PreconditionFailedException } from '#core/exception/http-exception';

import {
  createVoucherService,
  getAllVouchersService,
  getVoucherByIdService,
  updateVoucherByIdService,
  removeVoucherByIdService,
  checkExistVoucherCodeService,
  countAllVouchersService,
} from '#src/app/v1/vouchers/vouchers.service';
import { calculatePagination } from '#utils/pagination.util';

export const createVoucherController = async (req) => {
  const { code } = req.body;
  const isExistVoucherCode = await checkExistVoucherCodeService(code);
  if (isExistVoucherCode) {
    throw new NotFoundException('Voucher code already exist');
  }

  const newVoucher = await createVoucherService(req.body);

  const formatterVoucher = await getVoucherByIdService(newVoucher.id);

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Create voucher successfully',
    data: formatterVoucher,
  };
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

  return {
    statusCode: HttpStatus.OK,
    message: 'Get all vouchers successfully',
    data: {
      meta: metaData,
      list: vouchers,
    },
  };
};

export const getVoucherByIdController = async (req) => {
  const { id } = req.params;
  const existVoucher = await getVoucherByIdService(id);
  if (!existVoucher) {
    throw new ConflictException('Voucher code already exist');
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'Get one voucher successfully',
    data: existVoucher,
  };
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

  return {
    statusCode: HttpStatus.OK,
    message: 'Update voucher successfully',
    data: updatedVoucher,
  };
};

export const removeVoucherByIdController = async (req) => {
  const { id } = req.params;
  const existVoucher = await getVoucherByIdService(id, 'id');
  if (!existVoucher) {
    throw new ConflictException('Voucher code already exist');
  }

  const removeVoucher = await removeVoucherByIdService(id);

  return {
    statusCode: HttpStatus.OK,
    message: 'Remove voucher successfully',
    data: removeVoucher,
  };
};

export const isExistVoucherCodeController = async (req) => {
  const { code } = req.body;
  const isExistCode = await checkExistVoucherCodeService(code);

  return {
    statusCode: HttpStatus.OK,
    message: isExistCode ? 'Voucher code exists' : 'Voucher code does not exist',
    data: isExistCode,
  };
};
