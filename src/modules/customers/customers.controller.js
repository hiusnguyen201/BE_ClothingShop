import HttpStatus from "http-status-codes";
import {
  NotFoundException,
  ConflictException,
} from "#src/core/exception/http-exception";
import {
  updateUserAvatarByIdService,
  checkExistEmailService,
  createUserService,
  getUserByIdService,
  getAllUsersService,
  updateUserInfoByIdService,
  removeUserByIdService,
} from "#src/modules/users/users.service";
import { USER_TYPES } from "#src/core/constant";
import { randomStr } from "#src/utils/string.util";
import { sendPasswordService } from "#src/modules/mailer/mailer.service";

export const createCustomerController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const isExistEmail = await checkExistEmailService(email);
    if (isExistEmail) {
      throw new ConflictException("Email already exist");
    }

    const password = randomStr(32);
    const newCustomer = await createUserService({
      ...req.body,
      type: USER_TYPES.CUSTOMER,
    });

    sendPasswordService(email, password);

    if (req.file) {
      await updateUserAvatarByIdService(newCustomer._id, req.file);
    }

    const formatterCustomer = await getUserByIdService(newCustomer._id);

    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Create customer successfully",
      data: formatterCustomer,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCustomersController = async (req, res, next) => {
  try {
    const data = await getAllUsersService({
      ...req.query,
      type: USER_TYPES.CUSTOMER,
    });
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
    const { id } = req.params;
    const existCustomer = await getUserByIdService(id);
    if (!existCustomer) {
      throw new NotFoundException("Customer not found");
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get customer successfully",
      data: existCustomer,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCustomerByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const existCustomer = await getUserByIdService(id, "_id");
    if (!existCustomer) {
      throw new NotFoundException("Customer not found");
    }

    if (email) {
      const isExistEmail = await checkExistEmailService(email, id);
      if (isExistEmail) {
        throw new ConflictException("Email already exist");
      }
    }

    let updatedCustomer = await updateUserInfoByIdService(id, req.body);

    if (req.file) {
      updatedCustomer = await updateUserAvatarByIdService(
        id,
        req.file,
        updatedCustomer?.avatar
      );
    }

    return res.json({
      statusCode: HttpStatus.OK,
      message: "Update customer successfully",
      data: updatedCustomer,
    });
  } catch (err) {
    next(err);
  }
};

export const removeCustomerByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existCustomer = await getUserByIdService(id, "_id");
    if (!existCustomer) {
      throw new NotFoundException("Customer not found");
    }

    const removedCustomer = await removeUserByIdService(id);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Remove customer successfully",
      data: removedCustomer,
    });
  } catch (err) {
    next(err);
  }
};
