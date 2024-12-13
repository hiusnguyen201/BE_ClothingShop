import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";

import {
  createVoucherService,
  getAllVouchersService,
  getVoucherByIdService,
  updateVoucherByIdService,
  removeVoucherByIdService,
  updateVoucherImageByIdService,
  checkExistVoucherCodeService,
} from "#src/modules/vouchers/vouchers.service";

export const createVoucherController = async (req, res, next) => {
  try {
    const { code } = req.body;
    const isExistVoucher = await checkExistVoucherCodeService(code);
    if (isExistVoucher) {
      throw new BadRequestException("Voucher already exist");
    }

    const newVoucher = await createVoucherService({ ...req.body });

    if (req.file) {
      await updateVoucherImageByIdService(newVoucher._id, req.file);
    }

    const formatterVouches = await getVoucherByIdService(newVoucher._id);

    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create voucher successfully",
      data: formatterVouches,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllVouchersController = async (req, res, next) => {
  try {
    const data = await getAllVouchersService(req.query);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Get all voucher successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
export const getVoucherByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existVoucher = await getVoucherByIdService(id);
    if (!existVoucher) {
      throw new NotFoundException("User not found");
    }

    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Get one voucher successfully",
      data: existVoucher,
    });
  } catch (err) {
    next(err);
  }
};

export const updateVoucherByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existVoucher = await getVoucherByIdService(id, "_id uses");
    if (!existVoucher) {
      throw new NotFoundException("Voucher not found");
    }

    const { maxUses } = req.body;
    if (maxUses < existVoucher.uses) {
      throw new BadRequestException(
        `maxUses must be greater than the number of ${existVoucher.uses} `
      );
    }
    const updatedVoucher = await updateVoucherByIdService(id, req.body);

    if (req.file) {
      updatedVoucher = await updateVoucherImageByIdService(
        id,
        req.file,
        updatedfile?.image
      );
    }
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update voucher successfully",
      data: updatedVoucher,
    });
  } catch (err) {
    next(err);
  }
};

export const removeVoucherByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existVoucher = await getVoucherByIdService(id, "_id");
    if (!existVoucher) {
      throw new NotFoundException("Voucher not found");
    }
    const removeVoucher = await removeVoucherByIdService(id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove voucher successfully",
      data: removeVoucher,
    });
  } catch (err) {
    next(err);
  }
};
