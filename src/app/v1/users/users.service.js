import { isValidObjectId } from 'mongoose';
import { genSalt, genSaltSync, hashSync } from 'bcrypt';
import { UserModel } from '#src/models/user.model';
import { REGEX_PATTERNS } from '#src/core/constant';
import { USER_SELECTED_FIELDS, USER_STATUS, USER_TYPE } from '#src/app/v1/users/users.constant';

/**
 * Create user instance
 * @param {*} data
 * @returns
 */
export async function createUserService(data) {
  const salt = genSaltSync();
  data.password = hashSync(data.password, salt);
  data.type = USER_TYPE.USER;
  return UserModel.create(data);
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
export async function getAllUsersService({ filters, offset, limit, sortBy, sortOrder }) {
  return UserModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(USER_SELECTED_FIELDS)
    .sort({ [sortBy]: sortOrder })
    .lean();
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
  const filters = {
    type: USER_TYPE.USER,
  };

  if (isValidObjectId(id)) {
    filters._id = id;
  } else if (id.match(REGEX_PATTERNS.EMAIL)) {
    filters.email = id;
  } else {
    return null;
  }

  return UserModel.findOne(filters).select(USER_SELECTED_FIELDS).lean();
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeUserByIdService(id, removerId) {
  return UserModel.findByIdAndSoftDelete(id, removerId).select(USER_SELECTED_FIELDS).lean();
}

/**
 * Check exist email
 * @param {*} email
 * @param {*} skipId
 * @returns
 */
export async function checkExistEmailService(email, skipId) {
  const filters = { email };

  if (skipId) {
    filters._id = { $ne: skipId };
  }

  const user = await UserModel.findOne(filters, '_id', { withRemoved: true }).lean();
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
    .select(USER_SELECTED_FIELDS)
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
    .select(USER_SELECTED_FIELDS)
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
