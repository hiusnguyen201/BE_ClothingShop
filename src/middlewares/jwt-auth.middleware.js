'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import { checkUserHasPermissionByMethodAndEndpointService, getUserByIdService } from '#src/app/v1/users/users.service';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { verifyTokenService } from '#src/app/v1/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { REGEX_PATTERNS } from '#src/core/constant';

async function authorized(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return next(HttpException.new({ code: Code.TOKEN_REQUIRED }));
  }

  if (!token.match(REGEX_PATTERNS.BEARER_TOKEN)) {
    return next(HttpException.new({ code: Code.WRONG_TOKEN_FORMAT }));
  }

  token = token.split(' ')[1];

  const decoded = await verifyTokenService(token);
  if (!decoded) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  const user = await getUserByIdService(decoded.id);
  if (!user) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  if (!user.isVerified) {
    return next(HttpException.new({ code: Code.UNVERIFIED }));
  }

  req.user = decoded;
  next();
}

async function checkPermission(req, res, next) {
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
  return req.user?.type === USER_TYPE.CUSTOMER ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
}

export const isAuthorized = [authorized];
export const isAuthorizedAndIsCustomer = [authorized, checkCustomer];
export const isAuthorizedAndHasPermission = [authorized, checkPermission];
