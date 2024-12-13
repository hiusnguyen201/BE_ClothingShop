import HttpStatus from "http-status-codes";
import { NotFoundException } from "#src/core/exception/http-exception";

import {
  createVoucherService,
  findAllVouchersService,
  findVoucherByIdService,
  updateVoucherByIdService,
  removeVoucherByIdService
} from "#src/modules/vouchers/vouchers.service"

export const createVoucherController = async (req, res, next) => {
  try {
    const data = await createVoucherService({ ...req.body, file: req.file });
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create voucher successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllVouchersController = async (req, res, next) => {
  try {
    const data = await findAllVouchersService(req.query);
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
    const data = await findVoucherByIdService(req.params.id);
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Get one voucher successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateVoucherByIdController = async (req, res, next) => {
  try {
    const data = await updateVoucherByIdService(req.params.id, {
      ...req.body,
      file: req.file,
    });
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update voucher successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};


export const removeVoucherByIdController = async (req, res, next) => {
  try {
    const data = await removeVoucherByIdService(req.params.id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove voucher successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};