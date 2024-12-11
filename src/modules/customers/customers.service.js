import { isValidObjectId } from "mongoose";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import { makeHash } from "#src/utils/bcrypt.util";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { checkExistEmailService } from "#src/modules/users/users.service";
import { calculatePagination } from "#src/utils/pagination.util";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";

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

  if (file) {
    const result = await uploadImageBufferService({
      file,
      folderName: "customer-avatars",
    });
    data.avatar = result.public_id;
  }

  const hashedPassword = makeHash(password);
  const newCustomer = await UserModel.create({
    ...data,
    type: USER_TYPES.CUSTOMER,
    password: hashedPassword,
  });

  return await findCustomerByIdService(newCustomer._id);
}

/**
 * Find all customers
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
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    list: customers,
    meta: metaData,
  };
}

/**
 * Find customer by id
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
 * Update customer by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateCustomerByIdService(id, data) {
  const { file, email } = data;
  const existCustomer = await findCustomerByIdService(id, "_id avatar");
  if (!existCustomer) {
    throw new NotFoundException("Customer not found");
  }

  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw new BadRequestException("Email already exist");
    }
  }

  if (file) {
    if (existCustomer.avatar) {
      removeImageByPublicIdService(existCustomer.avatar);
    }
    const result = await uploadImageBufferService({
      file,
      folderName: "customer-avatars",
    });
    data.avatar = result.public_id;
  }

  return await UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove customer by id
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
