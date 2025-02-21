import { isValidObjectId } from 'mongoose';
import { UserModel } from '#src/app/users/models/user.model';
import { removeImageByPublicIdService, uploadImageBufferService } from '#modules/cloudinary/cloudinary.service';
import { REGEX_PATTERNS } from '#core/constant';
import { genSalt, hashSync } from 'bcrypt';

/**
 * Create user
 * @param {*} data
 * @returns
 */
export async function createUserService(data) {
  const salt = await genSalt();
  data.password = hashSync(data.password, salt);

  const user = new UserModel(data);

  return user.save();
}

/**
 * Insert users
 * @param {*} data
 * @returns
 */
export async function insertUsersService(data, options) {
  return UserModel.insertMany(data, options);
}

/**
 * Get all users
 * @param {*} query
 * @returns
 */
export async function getAllUsersService({ filters, offset = 0, limit = 10 }) {
  return UserModel.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 });
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
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else if (id.match(REGEX_PATTERNS.EMAIL)) {
    filter.email = id;
  } else {
    return null;
  }

  return UserModel.findOne(filter);
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeUserByIdService(id) {
  return UserModel.findByIdAndSoftDelete(id);
}

/**
 * Check exist email
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistEmailService(email, skipId) {
  const result = await UserModel.exists({
    _id: { $ne: skipId },
    email,
  });
  return !!result;
}

/**
 * Check exist user by id
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistUserByIdService(id) {
  const result = await UserModel.exists({
    _id: id,
  });
  return !!result;
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
    { new: true },
  );
}

/**
 * Change password by id
 * @param {*} id
 * @param {*} password
 * @returns
 */
export async function changePasswordByIdService(id, password) {
  const salt = await genSalt();
  password = hashSync(password, salt);

  return UserModel.findByIdAndUpdate(
    id,
    {
      password,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    },
    { new: true },
  );
}

/**
 * Update avatar by id
 * @param {*} id
 * @param {*} file
 * @returns
 */
export async function updateUserAvatarByIdService(id, file, currentPublicId) {
  if (currentPublicId) {
    await removeImageByPublicIdService(currentPublicId);
  }

  const result = await uploadImageBufferService({
    file,
    folderName: 'avatars',
  });

  return UserModel.findByIdAndUpdate(id, {
    avatar: result.public_id,
  });
}

/**
 * Update info by id
 * @param {*} id
 * @param {*} data
 */
export async function updateUserInfoByIdService(id, data) {
  return UserModel.findByIdAndUpdate(id, data, {
    new: true,
  });
}

export async function checkUserHasPermissionByMethodAndEndpointService(id, { method, endpoint }) {
  const user = await UserModel.findById(id)
    .select('role')
    .populate({
      path: 'role',
      select: 'permissions',
      populate: {
        path: 'permissions',
        match: {
          method,
          endpoint,
        },
      },
    });

  return Boolean(user?.role?.permissions?.length > 0);
}
