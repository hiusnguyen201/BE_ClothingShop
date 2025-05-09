import { isValidObjectId, Types } from 'mongoose';
import { genSaltSync, hashSync } from 'bcrypt';
import { UserModel } from '#src/app/users/models/user.model';
import { REGEX_PATTERNS } from '#src/core/constant';
import { USER_SELECTED_FIELDS, USER_TYPE } from '#src/app/users/users.constant';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { PERMISSION_SELECTED_FIELDS } from '#src/app/permissions/permissions.constant';
import { ROLE_SELECTED_FIELDS } from '#src/app/roles/roles.constant';

/**
 * New user service
 * @param {*} data
 * @returns
 */
export function newUserService(data) {
  const salt = genSaltSync();
  data.password = hashSync(data.password, salt);
  return new UserModel(data);
}

/**
 * Create user
 * @param {*} data
 * @returns
 */
export async function createUserService(data) {
  const salt = genSaltSync();
  data.password = hashSync(data.password, salt);
  const user = await UserModel.create(data);
  return user.toJSON();
}

/**
 * Insert users service
 * @param {*} data
 * @returns
 */
export async function insertUsersService(data = [], session) {
  return await UserModel.bulkSave(data, { session, ordered: true });
}

/**
 * Get and count users
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountUsersService(filters, skip, limit, sortBy, sortOrder) {
  const extraFilters = {
    ...filters,
    type: USER_TYPE.USER,
  };

  const totalCount = await UserModel.countDocuments(extraFilters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await UserModel.find(extraFilters, USER_SELECTED_FIELDS, queryOptions)
    .populate({ path: 'role', select: ROLE_SELECTED_FIELDS })
    .lean();

  return [totalCount, list];
}

/**
 * Get list user have permission
 * @returns
 */
export async function getListUserHavePermissionService(permissionName) {
  const users = await UserModel.find()
    .select('_id role permissions')
    .populate({
      path: 'role',
      select: 'permissions',
      populate: {
        path: 'permissions',
        match: {
          name: permissionName,
        },
      },
    })
    .populate({
      path: 'permissions',
      match: {
        name: permissionName,
      },
    })
    .lean();

  return users;
}

/**
 * Get user by id
 * @param {*} id
 * @returns
 */
export async function getUserByIdService(id) {
  const filters = {
    type: USER_TYPE.USER,
  };

  if (isValidObjectId(id)) {
    filters._id = id;
  } else {
    return null;
  }

  return UserModel.findOne(filters).select(USER_SELECTED_FIELDS).lean();
}

/**
 * Get profile by id
 * @param {*} id
 * @returns
 */
export async function getProfileByIdService(id) {
  const filters = {};

  if (isValidObjectId(id)) {
    filters._id = id;
  } else {
    return null;
  }

  return UserModel.findOne(filters).select(USER_SELECTED_FIELDS).lean();
}

/**
 * Get user by email
 * @param {string} email
 * @param {*} extras
 * @returns
 */
export async function getUserByEmailService(email, selectedFields = USER_SELECTED_FIELDS) {
  if (!email) return null;

  const filters = {};

  if (email.match(REGEX_PATTERNS.EMAIL)) {
    filters.email = email;
  } else {
    return null;
  }

  return UserModel.findOne(filters).select(selectedFields).lean();
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

/**
 * Update verified by id
 * @param {*} id
 * @returns
 */
export async function updateUserVerifiedByIdService(id) {
  return UserModel.findByIdAndUpdate(
    id,
    {
      verifiedAt: new Date(),
    },
    { new: true },
  )
    .select(USER_SELECTED_FIELDS)
    .lean();
}

/**
 * Update user password
 * @param {*} data
 * @returns
 */
export function updateUserPasswordService(userId, password) {
  const salt = genSaltSync();
  const hashed = hashSync(password, salt);
  return UserModel.findByIdAndUpdate(userId, {
    password: hashed,
  })
    .select(USER_SELECTED_FIELDS)
    .lean();
}

/**
 * Remove user by id
 * @param {*} id
 * @returns
 */
export async function removeUserByIdService(id) {
  return UserModel.findByIdAndSoftDelete(id).select(USER_SELECTED_FIELDS).lean();
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
 * Check user has permissions
 * @param {string} id
 * @param {string[]} permissions
 * @returns
 */
export async function checkUserHasPermissionService(id, permissions) {
  const user = await UserModel.findById(id)
    .select('role permissions')
    .populate({
      path: 'role',
      select: 'permissions',
      populate: {
        path: 'permissions',
        match: {
          name: {
            $in: permissions,
          },
        },
      },
    })
    .populate({
      path: 'permissions',
      match: {
        name: {
          $in: permissions,
        },
      },
    })
    .lean();

  return Boolean(user?.role?.permissions?.length > 0 || user?.permissions.length > 0);
}

/**
 * Get list user permission by id
 * @param {string} userId
 * @param {object} filters
 * @param {number} skip
 * @param {number} limit
 * @param {string} sortBy
 * @param {string} sortOrder
 * @returns
 */
export async function getAndCountUserPermissionsService(userId, filters, skip, limit, sortBy, sortOrder) {
  const filterUser = {};

  if (isValidObjectId(userId)) {
    filterUser._id = userId;
  } else if (userId.match(REGEX_PATTERNS.SLUG)) {
    filterUser.slug = userId;
  } else {
    filterUser.name = userId;
  }

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const user = await UserModel.findOne(filterUser)
    .populate({
      path: 'permissions',
      select: PERMISSION_SELECTED_FIELDS,
      ...(filters ? { match: filters } : {}),
      options: queryOptions,
    })
    .select('permissions')
    .lean();

  const userPermissions = await UserModel.aggregate([
    { $match: { ...filterUser, ...(filterUser?._id ? { _id: new Types.ObjectId(filterUser._id) } : {}) } },
    {
      $lookup: {
        from: 'permissions',
        localField: 'permissions',
        foreignField: '_id',
        as: 'userPermissions',
        pipeline: [{ $match: filters }],
      },
    },
    {
      $project: {
        _id: true,
        totalCount: {
          $size: '$userPermissions',
        },
      },
    },
  ]);

  return [userPermissions[0].totalCount, user.permissions];
}

/**
 * Add user permission
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function addUserPermissionsService(userId, permissionIds) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        permissions: { $each: permissionIds },
      },
    },
    { new: true },
  )
    .select('permissions')
    .lean();
}

/**
 * Remove user permission
 * @param {*} id
 * @param {*} permissions
 * @returns
 */
export async function removeUserPermissionByIdService(userId, permissionId) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: {
        permissions: permissionId,
      },
    },
    { new: true },
  )
    .select('permissions')
    .lean();
}
