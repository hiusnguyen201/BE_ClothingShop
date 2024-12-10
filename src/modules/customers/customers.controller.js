import HttpStatus from "http-status-codes";
import {
  createCustomerService,
  findAllCustomersService,
  findCustomerByIdService,
  updateCustomerByIdService,
  removeCustomerByIdService,
} from "#src/modules/customers/customers.service";
import { NotFoundException } from "#src/core/exception/http-exception";

export const createCustomerController = async (req, res, next) => {
  try {
    const data = await createCustomerService({
      ...req.body,
      file: req.file,
    });
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create customer successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCustomersController = async (req, res, next) => {
  try {
    const data = await findAllCustomersService(req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get all customers successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerByIdController = async (req, res, next) => {
  try {
    const data = await findCustomerByIdService(req.params.id);
    if (!data) {
      throw new NotFoundException("Customer not found");
    }
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get customer successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCustomerByIdController = async (req, res, next) => {
  try {
    const data = await updateCustomerByIdService(req.params.id, {
      ...req.body,
      file: req.file,
    });
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update customer successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const removeCustomerByIdController = async (req, res, next) => {
  try {
    const data = await removeCustomerByIdService(req.params.id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove customer successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
