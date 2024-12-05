import moment from "moment-timezone";
import { isValidObjectId } from "mongoose";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import {
  cropImagePathByVersionService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import { makeHash } from "#src/utils/bcrypt.util";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";

const SELECTED_FIELDS = "_id avatar name email status birthday gender";

/**
 * Create user
 * @param {*} data
 * @returns
 */
export async function createUserService(data) {
  const { file, email } = data;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new BadRequestException("Email already exist");
  }

  const newUser = await UserModel.create({
    ...data,
    type: USER_TYPES.USER,
  });

  if (file) {
    await updateAvatarByIdService(newUser._id, file);
  }

  return await findUserByIdService(newUser._id);
}

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

  return await findUserById(newCustomer._id);
}

/**
 * Find all users
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function findAllUsersService(
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
  };

  const totalItems = await UserModel.countDocuments(filterOptions);
  const totalPages = Math.ceil(totalItems / itemPerPage);

  if (page <= 0 || !page) {
    page = 1;
  } else if (page > totalPages && totalPages >= 1) {
    page = totalPages;
  }

  const offSet = (page - 1) * itemPerPage;

  const users = await UserModel.find(filterOptions)
    .skip(offSet)
    .limit(itemPerPage)
    .select(selectFields);

  return {
    list: users,
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
export async function findUserByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  const filter = {};

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
 * Find one user by reset password token
 * @param {*} token
 * @returns
 */
export async function findUserByResetPasswordTokenService(token) {
  const user = await UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: moment().valueOf() },
  });
  return user;
}

/**
 * Update info user by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateUserByIdService(id, data) {
  const { file, email } = data;
  const existUser = await findUserByIdService(id, "_id");
  if (!existUser) {
    throw new NotFoundException("User not found");
  }

  // Check exist email
  if (email) {
    const isExistEmail = await checkExistEmailService(
      email,
      existUser._id
    );
    if (isExistEmail) {
      throw new BadRequestException("Email already exist");
    }
  }

  const user = await UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);

  if (file) {
    await updateAvatarByIdService(user._id, file);
  }

  return user;
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeUserByIdService(id) {
  const existUser = await findUserByIdService(id, "_id");
  if (!existUser) {
    throw new NotFoundException("User not found");
  }

  return await UserModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Update avatar by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateAvatarByIdService(id, file) {
  const folderName = "avatars";
  const result = await uploadImageBufferService({
    file,
    folderName,
  });

  const cropImagePath = cropImagePathByVersionService({
    url: result.url,
    version: result.version,
  });

  return await UserModel.findByIdAndUpdate(
    id,
    {
      avatar: cropImagePath,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Check exist email
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistEmailService(email, skipId) {
  return await UserModel.findOne({
    email,
    _id: { $ne: skipId },
  }).select("_id email");
}
