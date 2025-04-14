'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import { checkUserHasPermissionByMethodAndEndpointService, getUserByIdService } from '#src/app/users/users.service';
import { USER_TYPE } from '#src/app/users/users.constant';
import { verifyTokenService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { ACCESS_TOKEN_KEY, clearSession } from '#src/utils/cookie.util';

async function authorized(req, res, next) {
  const accessToken = req.cookies[ACCESS_TOKEN_KEY];

  if (!accessToken) {
    clearSession(res);
    return next(HttpException.new({ code: Code.TOKEN_REQUIRED }));
  }

  const decoded = await verifyTokenService(accessToken);
  if (!decoded) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  const user = await getUserByIdService(decoded?.id);
  if (!user) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  if (!user.verifiedAt) {
    return next(HttpException.new({ code: Code.ACCESS_DENIED }));
  }

  req.user = decoded;
  next();
}

async function checkPermission(req, res, next) {
  if (!req.user || req.user.type === USER_TYPE.CUSTOMER) {
    return next(HttpException.new({ code: Code.ACCESS_DENIED }));
  }

  // Convert to dynamic path
  let endpoint = req.originalUrl;
  Object.entries(req.params).map(([key, value]) => {
    endpoint = endpoint.replace(value, `:${key}`);
  });
  if (endpoint.includes('?')) {
    endpoint = endpoint.split('?')[0];
  }

  const hasPermission = await checkUserHasPermissionByMethodAndEndpointService(req.user.id, {
    method: req.method,
    endpoint,
  });
  return hasPermission ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
}

async function checkCustomer(req, res, next) {
  return next()
  return req.user?.type === USER_TYPE.CUSTOMER ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
}

export const isAuthorized = [authorized];
export const isAuthorizedAndIsCustomer = [authorized, checkCustomer];
export const isAuthorizedAndHasPermission = [authorized, checkPermission];
