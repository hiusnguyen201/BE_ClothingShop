import { HttpException } from '#src/core/exception/http-exception';
import { checkUserHasPermissionService, getProfileByIdService, getUserByIdService } from '#src/app/users/users.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { verifyTokenService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { ACCESS_TOKEN_KEY } from '#src/utils/cookie.util';

export async function authorized(req, res, next) {
  const accessToken = req.cookies[ACCESS_TOKEN_KEY];
  if (!accessToken) {
    return next(HttpException.new({ code: Code.TOKEN_REQUIRED }));
  }

  const decoded = await verifyTokenService(accessToken);
  if (!decoded) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  const user = await getProfileByIdService(decoded?.id);
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

    const hasPermission = await checkUserHasPermissionService(req.user.id, permissions);

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
