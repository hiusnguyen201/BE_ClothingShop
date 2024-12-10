import { isValidObjectId } from "mongoose";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import { makeHash } from "#src/utils/bcrypt.util";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { updateAvatarByIdService, checkExistEmailService } from "#src/modules/users/users.service";

const SELECTED_FIELDS = "_id avatar name email status birthday gender type";

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
    await updateAvatarByIdService(newCustomer._id, file);
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
  let { keyword = "", status, itemPerPage = 10, page = 1 } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
    [status && "status"]: status,
    type: USER_TYPES.CUSTOMER
  };

  const totalItems = await UserModel.countDocuments(filterOptions);
  const totalPages = Math.ceil(totalItems / itemPerPage);

  if (page <= 0 || !page) {
    page = 1;
  } else if (page > totalPages && totalPages >= 1) {
    page = totalPages;
  }

  const offSet = (page - 1) * itemPerPage;
  const customers = await UserModel.find(filterOptions)
    .skip(offSet)
    .limit(itemPerPage)
    .select(selectFields);
  return {
    list: customers,
    meta: {
      offSet,
      itemPerPage,
      currentPage: page,
      totalPages,
      totalItems,
      isNext: page < totalPages,
      isPrevious: page > 1,
      isFirst: page > 1 && page <= totalPages,
      isLast: page >= 1 && page < totalPages,
    },
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
    const isExistEmail = await checkExistEmailService(
      email,
      existCustomer._id
    );
    if (isExistEmail) {
      throw new BadRequestException("Email already exist");
    }
  }

  if (file) {
    await removeImages(FOLDER_ICONS + `/${id}`);
    await updateAvatarByIdService(existCustomer._id, file);
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
