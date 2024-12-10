import { isValidObjectId } from "mongoose";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import { makeHash } from "#src/utils/bcrypt.util";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import {
  updateUserAvatarByIdService,
  checkExistEmailService,
} from "#src/modules/users/users.service";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS =
  "_id avatar name email status birthday gender type";

/**
 * Create customer
 * @param {*} data
 * @returns
 */
export async function createCustomerService(data) {
  const { password, file, email } = data;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new BadRequestException("Email already exist");
  }

  const hashedPassword = makeHash(password);
  const newCustomer = await UserModel.create({
    ...data,
    type: USER_TYPES.CUSTOMER,
    password: hashedPassword,
  });

  if (file) {
    updateUserAvatarByIdService(newCustomer._id, file);
  }

  return await findCustomerByIdService(newCustomer._id);
}

/**
 * Find all users
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function findAllCustomersService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let { keyword = "", status, limit = 10, page = 1 } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
    [status && "status"]: status,
    type: USER_TYPES.CUSTOMER,
  };

  const totalCount = await UserModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const customers = await UserModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields);
  return {
    list: customers,
    meta: metaData,
  };
}

/**
 * Find one user by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function findCustomerByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = { type: USER_TYPES.CUSTOMER };

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (REGEX_PATTERNS.EMAIL.test(id)) {
    filter.email = id;
  } else {
    return null;
  }

  return await UserModel.findOne(filter).select(selectFields);
}

/**
 * Update info user by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateCustomerByIdService(id, data) {
  const { file, email } = data;
  const existCustomer = await findCustomerByIdService(id, "_id");
  if (!existCustomer) {
    throw new NotFoundException("Customer not found");
  }

  // Check exist email
  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw new BadRequestException("Email already exist");
    }
  }

  if (file) {
    updateUserAvatarByIdService(id, file);
  }

  const customer = await UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);

  return customer;
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeCustomerByIdService(id) {
  const existCustomer = await findCustomerByIdService(id, "_id");
  if (!existCustomer) {
    throw new NotFoundException("Customer not found");
  }

  return await UserModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}
