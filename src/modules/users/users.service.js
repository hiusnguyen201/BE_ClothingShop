import { isValidObjectId } from "mongoose";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import { makeHash } from "#src/utils/bcrypt.util";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import { randomStr } from "#src/utils/string.util";
import { sendPasswordService } from "#src/modules/mailer/mailer.service";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS =
  "_id avatar name email status birthday gender role";

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

  if (file) {
    const result = await uploadImageBufferService({
      file,
      folderName: "user-avatars",
    });
    data.avatar = result.public_id;
  }

  const password = randomStr(32);
  const hashedPassword = makeHash(password);
  const newUser = await UserModel.create({
    ...data,
    password: hashedPassword,
    type: USER_TYPES.USER,
  });

  sendPasswordService(email, password);

  return await findUserByIdService(newUser._id);
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
  let { keyword = "", status, limit = 10, page = 1 } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
    [status && "status"]: status,
    type: USER_TYPES.USER,
  };

  const totalCount = await UserModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const users = await UserModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    list: users,
    meta: metaData,
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
  const filter = { type: USER_TYPES.USER };

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
export async function updateUserByIdService(id, data) {
  const { file, email } = data;
  const existUser = await findUserByIdService(id, "_id");
  if (!existUser) {
    throw new NotFoundException("User not found");
  }

  if (email) {
    const isExistEmail = await checkExistEmailService(email, id);
    if (isExistEmail) {
      throw new BadRequestException("Email already exist");
    }
  }

  if (file) {
    if (existUser.avatar) {
      removeImageByPublicIdService(existUser.avatar);
    }
    const result = await uploadImageBufferService({
      file,
      folderName: "user-avatars",
    });
    data.avatar = result.public_id;
  }

  return await UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
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
 * Check exist email
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistEmailService(email, skipId) {
  const user = await UserModel.findOne({
    _id: { $ne: skipId },
    email,
  }).select("_id");

  return Boolean(user);
}

/**
 * Update verified by id
 * @param {*} id
 * @returns
 */
export async function updateVerifiedByIdService(id) {
  return await UserModel.findByIdAndUpdate(
    id,
    {
      isVerified: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Change password by id
 * @param {*} id
 * @param {*} password
 * @returns
 */
export async function changePasswordByIdService(id, password) {
  const hashedPassword = makeHash(password);
  return await UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}
