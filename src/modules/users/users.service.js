import { isValidObjectId } from "mongoose";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { REGEX_PATTERNS, USER_TYPES } from "#src/core/constant";
import { calculatePagination } from "#src/utils/pagination.util";

const SELECTED_FIELDS =
  "_id avatar name email status birthday gender createdAt updatedAt";

/**
 * Create user
 * @param {*} data
 * @returns
 */
export async function createUserService(data) {
  return await UserModel.create(data);
}

/**
 * Get all users
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllUsersService(
  query,
  selectFields = SELECTED_FIELDS
) {
  let {
    keyword = "",
    limit = 10,
    page = 1,
    type = USER_TYPES.CUSTOMER,
  } = query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
    type,
  };

  const totalCount = await UserModel.countDocuments(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const users = await UserModel.find(filterOptions)
    .skip(metaData.offset)
    .limit(metaData.limit)
    .select(selectFields)
    .sort({ createdAt: -1 });

  return {
    meta: metaData,
    list: users,
  };
}

/**
 * Get one user by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getUserByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
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
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeUserByIdService(id) {
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
export async function updateUserVerifiedByIdService(id) {
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

/**
 * Update avatar by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateUserAvatarByIdService(
  id,
  file,
  currentAvatar
) {
  if (currentAvatar) {
    removeImageByPublicIdService(currentAvatar);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: "avatars",
  });

  return await UserModel.findByIdAndUpdate(id, {
    avatar: result.public_id,
  }).select(SELECTED_FIELDS);
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 */
export async function updateUserInfoByIdService(id, data) {
  return await UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}
