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
import { randomStr } from "#src/utils/string.util";
import { sendPasswordService } from "#src/modules/mailer/mailer.service";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS = "_id avatar name email status birthday gender";
const FOLDER_AVATARS = "avatars";

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

  const password = randomStr(32);
  const hashedPassword = makeHash(password);
  const newUser = await UserModel.create({
    ...data,
    password: hashedPassword,
    type: USER_TYPES.USER,
  });

  sendPasswordService(email, password);

  if (file) {
    updateUserAvatarByIdService(newUser._id, file);
  }

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
    .select(selectFields);

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
  if (!id) return null;
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
    const isExistEmail = await checkExistEmailService(
      email,
      existUser._id
    );
    if (isExistEmail) {
      throw new BadRequestException("Email already exist");
    }
  }

  if (file) {
    updateUserAvatarByIdService(existUser._id, file);
  }

  const user = await UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);

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

export async function updateUserAvatarByIdService(id, file) {
  const folderName = `${FOLDER_AVATARS}/${id}`;
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
