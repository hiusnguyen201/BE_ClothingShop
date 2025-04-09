import { isValidObjectId, Types } from 'mongoose';
import { genSaltSync, hashSync } from 'bcrypt';
import { UserModel } from '#src/app/users/models/user.model';
import { REGEX_PATTERNS } from '#src/core/constant';
import { USER_SELECTED_FIELDS } from '#src/app/users/users.constant';
import { extendQueryOptionsWithPagination, extendQueryOptionsWithSort } from '#src/utils/query.util';
import { PERMISSION_SELECTED_FIELDS } from '#src/app/permissions/permissions.constant';
import { ROLE_SELECTED_FIELDS } from '#src/app/roles/roles.constant';

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
 * Create users within transaction
 * @param {*} data
 * @returns
 */
export async function getOrCreateUsersService(data, session) {
  const existingUsers = await UserModel.find({
    email: data.map((item) => item.email),
  }).lean();

  const existingSet = new Set(existingUsers.map((p) => p.email));

  const newUsers = data.filter((p) => !existingSet.has(p.email));

  if (newUsers.length > 0) {
    const created = await UserModel.insertMany(
      newUsers.map((item) => ({ ...item, password: hashSync(item.password, genSaltSync()) })),
      { session },
    );
    return [...existingUsers, ...created];
  }

  return existingUsers;
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
  const totalCount = await UserModel.countDocuments(filters);

  const queryOptions = {
    ...extendQueryOptionsWithPagination(skip, limit),
    ...extendQueryOptionsWithSort(sortBy, sortOrder),
  };

  const list = await UserModel.find(filters, USER_SELECTED_FIELDS, queryOptions)
    .populate({ path: 'role', select: ROLE_SELECTED_FIELDS })
    .lean();

  return [totalCount, list];
}

/**
 * Get one user by id
 * @param {*} id
 * @returns
 */
export async function getUserByIdService(id, extras = {}) {
  if (!id) return null;
  const filters = {
    ...extras,
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

export async function checkUserHasPermissionService(id, method, endpoint) {
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
        },
      },
    })
    .populate({
      path: 'permissions',
      match: {
        method,
        endpoint,
      },
    });

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
 * Get user permission
 * @param {string} userId
 * @param {string} permissionId
 * @returns
 */
export async function getUserPermissionService(userId, permissionId) {
  return UserModel.findById(userId)
    .populate({
      path: 'permissions',
      select: '_id',
      match: { _id: permissionId },
    })
    .select('permissions')
    .lean();
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
