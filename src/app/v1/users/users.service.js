import { isValidObjectId } from 'mongoose';
import { UserModel } from '#models/user.model';
import { removeImageByPublicIdService, uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { REGEX_PATTERNS } from '#core/constant';
import { genSalt, genSaltSync, hashSync } from 'bcrypt';
import { USER_STATUS } from '#src/app/v1/users/users.constant';

const SELECTED_FIELDS = '_id avatar name email phone password type gender createdAt updatedAt';

/**
 * Create user instance
 * @param {*} data
 * @returns
 */
export async function createUserService(data) {
  const salt = genSaltSync();
  data.password = hashSync(data.password, salt);
  return new UserModel(data);
}

export async function saveUserService(user) {
  return user.save();
}

/**
 * Create user within transaction
 * @param {*} data
 * @returns
 */
export async function getOrCreateUserWithTransaction(data, session) {
  const user = await UserModel.findOne({ email: data.email }).lean();

  if (user) {
    return user;
  }

  const salt = await genSalt();
  data.password = hashSync(data.password, salt);
  const [created] = await UserModel.insertMany([data], {
    session,
  });
  return created;
}

/**
 * Get all users
 * @param {*} query
 * @returns
 */
export async function getAllUsersService({ filters, offset = 0, limit = 10 }) {
  return UserModel.find(filters).skip(offset).limit(limit).select(SELECTED_FIELDS).sort({ createdAt: -1 }).lean();
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
 * @returns
 */
export async function getUserByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.EMAIL)) {
    filter.email = id;
  } else {
    return null;
  }

  return UserModel.findOne(filter).select(SELECTED_FIELDS).lean();
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeUserByIdService(id, removerId) {
  return UserModel.findByIdAndSoftDelete(id, removerId).select(SELECTED_FIELDS).lean();
}

/**
 * Check exist email
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistEmailService(email, skipId) {
  const user = await UserModel.findOne(
    {
      _id: { $ne: skipId },
      email,
    },
    '_id',
    { withDeleted: true },
  ).lean();

  return !!user;
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
      verifiedAt: new Date(),
      status: USER_STATUS.ACTIVE,
    },
    { new: true },
  )
    .select(SELECTED_FIELDS)
    .lean();
}

/**
 * Change password by id
 * @param {*} id
 * @param {*} password
 * @returns
 */
export async function changePasswordByIdService(id, password) {
  const salt = genSaltSync();
  const hashedPassword = hashSync(password, salt);
  return UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    },
    { new: true },
  )
    .select(SELECTED_FIELDS)
    .lean();
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
    folderName: 'avatars',
  });

  return UserModel.findByIdAndUpdate(id, {
    avatar: result.public_id,
  })
    .select(SELECTED_FIELDS)
    .lean();
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 */
export async function updateUserInfoByIdService(id, data) {
  return UserModel.findByIdAndUpdate(id, data, {
    new: true,
  })
    .select(SELECTED_FIELDS)
    .lean();
}

export async function checkUserHasPermissionByMethodAndEndpointService(id, { method, endpoint }) {
  const user = await UserModel.findById(id)
    .lean()
    .select('role')
    .populate({
      path: 'role',
      select: 'permissions',
      populate: {
        path: 'permissions',
        match: {
          method,
          endpoint,
          isActive: true,
        },
      },
    });

  return Boolean(user?.role?.permissions?.length > 0);
}
