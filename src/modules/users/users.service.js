import { isValidObjectId } from "mongoose";
import { UserModel } from "#src/modules/users/schemas/user.schema";
import {
  removeImageByPublicIdService,
  uploadImageBufferService,
} from "#src/modules/cloudinary/cloudinary.service";
import { REGEX_PATTERNS } from "#src/core/constant";
import { makeHash } from "#src/utils/bcrypt.util";

const SELECTED_FIELDS =
  "_id avatar name email status birthday gender lockedUntil createdAt updatedAt";

/**
 * Create user
 * @param {*} data
 * @returns
 */
export async function createUserService(data) {
  return UserModel.create(data);
}

/**
 * Get all users
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllUsersService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return UserModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all users
 * @param {*} filters
 * @returns
 */
export async function countAllUsersService(filters) {
  return UserModel.countDocuments(filters);
}

/**
 * Get one user by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getUserByIdService(id, selectFields = SELECTED_FIELDS) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.EMAIL)) {
    filter.email = id;
  } else {
    return null;
  }

  return UserModel.findOne(filter).select(selectFields);
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeUserByIdService(id) {
  return UserModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
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
  return UserModel.findByIdAndUpdate(
    id,
    {
      isVerified: true,
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Update verified by id
 * @param {*} id
 * @returns
 */
export async function updateUserLockUntilByIdService(id, timeLock) {
  return UserModel.findByIdAndUpdate(
    id,
    {
      lockedUntil: timeLock,
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
  return UserModel.findByIdAndUpdate(
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
export async function updateUserAvatarByIdService(id, file, currentAvatar) {
  if (currentAvatar) {
    removeImageByPublicIdService(currentAvatar);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: "avatars",
  });

  return UserModel.findByIdAndUpdate(id, {
    avatar: result.public_id,
  }).select(SELECTED_FIELDS);
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 */
export async function updateUserInfoByIdService(id, data) {
  return UserModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

export async function checkUserHasPermissionByMethodAndEndpointService(
  id,
  { method, endpoint }
) {
  const user = await UserModel.findById(id)
    .select("role")
    .populate({
      path: "role",
      select: "permissions",
      populate: {
        path: "permissions",
        match: {
          method,
          endpoint,
        },
      },
    });

  return Boolean(user?.role?.permissions?.length > 0);
}
