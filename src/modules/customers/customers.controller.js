import HttpStatus from "http-status-codes";
import {
  NotFoundException,
  ConflictException,
  BadGatewayException,
} from "#src/core/exception/http-exception";
import {
  updateUserAvatarByIdService,
  checkExistEmailService,
  createUserService,
  getUserByIdService,
  getAllUsersService,
  updateUserInfoByIdService,
  removeUserByIdService,
  countAllUsersService,
} from "#src/modules/users/users.service";
import { USER_TYPES } from "#src/core/constant";
import { randomStr } from "#src/utils/string.util";
import { sendPasswordService } from "#src/modules/mailer/mailer.service";
import {
  addVoucherToCustomerService,
  getAllVouchersByCustomerService,
} from "#src/modules/customers/customers.service";
import { getVoucherByCodeService } from "#src/modules/vouchers/vouchers.service";
import { calculatePagination } from "#src/utils/pagination.util";

export const createCustomerController = async (req, res) => {
  const { email } = req.body;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException("Email already exist");
  }

  const password = randomStr(32);
  const hashedPassword = makeHash(password);
  const newCustomer = await createUserService({
    ...req.body,
    password: hashedPassword,
    type: USER_TYPES.CUSTOMER,
  });

  await sendPasswordService(email, password);

  if (req.file) {
    await updateUserAvatarByIdService(newCustomer._id, req.file);
  }

  const formatterCustomer = await getUserByIdService(newCustomer._id);

  return res.json({
    statusCode: HttpStatus.CREATED,
    message: "Create customer successfully",
    data: formatterCustomer,
  });
};

export const getAllCustomersController = async (req, res) => {
  let { keyword = "", limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
    type: USER_TYPES.CUSTOMER,
  };

  const totalCount = await countAllUsersService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const customers = await getAllUsersService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return res.json({
    statusCode: HttpStatus.OK,
    message: "Get all customers successfully",
    data: { meta: metaData, list: customers },
  });
};

export const getCustomerByIdController = async (req, res) => {
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
};

export const updateCustomerByIdController = async (req, res) => {
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
};

export const removeCustomerByIdController = async (req, res) => {
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
};

export const claimVoucherByCodeController = async (req, res, next) => {
  try {
    const { voucherCode } = req.body;
    const userId = "675daed04cc3d82f1ef5d20b";

    const voucher = await getVoucherByCodeService(voucherCode);
    if (!voucher) {
      throw new NotFoundException("Voucher not found");
    }

    const user = await getUserByIdService(userId, "vouchers");

    if (user.vouchers.includes(voucher._id)) {
      throw new ConflictException("Voucher already claim");
    }

    await addVoucherToCustomerService(userId, voucher._id);

    return res.json({
      statusCode: HttpStatus.NO_CONTENT,
      message: "Claim voucher by code successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllVoucherFromCustomerController = async (
  req,
  res,
  next
) => {
  try {
    const userId = "675daed04cc3d82f1ef5d20b";
    const data = await getAllVouchersByCustomerService(userId, req.query);
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Get customer successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
