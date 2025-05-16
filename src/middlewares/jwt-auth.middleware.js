import { HttpException } from '#src/core/exception/http-exception';
import { checkUserHasPermissionRepository, getProfileByIdRepository } from '#src/app/users/users.repository';
import { USER_TYPE } from '#src/app/users/users.constant';
import { Code } from '#src/core/code/Code';
import { ACCESS_TOKEN_KEY, verifyToken } from '#src/utils/session.util';

export async function authorized(req, res, next) {
  const accessToken = req.cookies[ACCESS_TOKEN_KEY];
  if (!accessToken) {
    return next(HttpException.new({ code: Code.TOKEN_REQUIRED }));
  }

  const decoded = await verifyToken(accessToken);
  if (!decoded) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  const user = await getProfileByIdRepository(decoded?.id);
  if (!user) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  if (!user.verifiedAt) {
    return next(HttpException.new({ code: Code.ACCESS_DENIED }));
  }

  req.user = decoded;
  next();
}

/**
 * Check Permissions
 * @param {string[]} permissions
 * @returns
 */
export function can(permissions = []) {
  return async (req, res, next) => {
    if (!req.user || req.user.type === USER_TYPE.CUSTOMER) {
      return next(HttpException.new({ code: Code.ACCESS_DENIED }));
    }

    const hasPermission = await checkUserHasPermissionRepository(req.user.id, permissions);

    return hasPermission ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
  };
}

async function checkCustomer(req, res, next) {
  return req.user?.type === USER_TYPE.CUSTOMER ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
}

async function checkUser(req, res, next) {
  return req.user?.type === USER_TYPE.USER ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
}

export const isAuthorized = [authorized];
export const isAuthorizedAndIsCustomer = [authorized, checkCustomer];
export const isAuthorizedAndIsUser = [authorized, checkUser];
